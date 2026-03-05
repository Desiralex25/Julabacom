import React, { useState, useMemo } from 'react';
import { ImagePickerField } from '../shared/ImagePickerField';
import { SelectWithAutre } from '../shared/SelectWithAutre';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Users,
  Clock,
  Truck,
  CheckCircle,
  Calendar,
  MapPin,
  Plus,
  Search,
  Mic,
  MicOff,
  X,
  Send,
  ChevronRight,
  Phone,
  Wallet,
  FileText,
  AlertTriangle,
  ArrowRight,
  History,
  ShoppingBag,
  Edit3,
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { useModalRegister } from '../../contexts/ModalContext';
import { toast } from 'sonner';
import { SearchBar } from '../shared/SearchBar';
import { matchesSearch } from '../../utils/searchUtils';

const C = '#2072AF';
const C_DARK = '#1E5A8E';
const C_LIGHT = '#EBF4FB';

type StatutCommande = 'brouillon' | 'envoyee' | 'confirmee' | 'en_livraison' | 'livree';

interface Commande {
  id: string;
  produit: string;
  quantite: number;
  unite: string;
  nombreMembres: number;
  producteur: string;
  localisation: string;
  dateCreation: string;
  dateLivraison: string;
  statut: StatutCommande;
  montantTotal: number;
  telephone?: string;
}

const mockCommandes: Commande[] = [
  { id: '1', produit: 'Riz local', quantite: 500, unite: 'kg', nombreMembres: 8, producteur: 'Kouassi Jean', localisation: 'Yamoussoukro', dateCreation: '2026-03-03', dateLivraison: '2026-03-10', statut: 'brouillon', montantTotal: 325000, telephone: '+225 07 01 23 45' },
  { id: '2', produit: 'Ignames fraîches', quantite: 350, unite: 'kg', nombreMembres: 12, producteur: 'Kone Aminata', localisation: 'Bouaké', dateCreation: '2026-03-02', dateLivraison: '2026-03-09', statut: 'envoyee', montantTotal: 140000, telephone: '+225 05 34 56 78' },
  { id: '3', produit: 'Tomates', quantite: 800, unite: 'kg', nombreMembres: 15, producteur: 'Traoré Mamadou', localisation: 'Korhogo', dateCreation: '2026-02-28', dateLivraison: '2026-03-07', statut: 'confirmee', montantTotal: 280000, telephone: '+225 01 45 67 89' },
  { id: '4', produit: 'Bananes plantain', quantite: 200, unite: 'régimes', nombreMembres: 10, producteur: 'Diabaté Ibrahim', localisation: 'Adzopé', dateCreation: '2026-02-27', dateLivraison: '2026-03-05', statut: 'en_livraison', montantTotal: 50000, telephone: '+225 07 56 78 90' },
  { id: '5', produit: 'Oignons', quantite: 600, unite: 'kg', nombreMembres: 18, producteur: 'Yao Akissi', localisation: 'Abengourou', dateCreation: '2026-02-25', dateLivraison: '2026-03-03', statut: 'livree', montantTotal: 240000, telephone: '+225 05 67 89 01' },
  { id: '6', produit: 'Maïs sec', quantite: 1000, unite: 'kg', nombreMembres: 20, producteur: 'Bamba Sekou', localisation: 'Daloa', dateCreation: '2026-03-01', dateLivraison: '2026-03-12', statut: 'brouillon', montantTotal: 420000, telephone: '+225 01 78 90 12' },
  { id: '7', produit: 'Manioc', quantite: 450, unite: 'kg', nombreMembres: 9, producteur: 'Coulibaly Aminata', localisation: 'Séguéla', dateCreation: '2026-02-26', dateLivraison: '2026-03-06', statut: 'livree', montantTotal: 135000, telephone: '+225 07 89 01 23' },
];

const STATUT_CONFIG: Record<StatutCommande, { label: string; icon: React.ElementType; color: string; bg: string; border: string; gradient: string }> = {
  brouillon:    { label: 'Brouillon',    icon: Edit3,       color: '#9CA3AF', bg: 'bg-gray-100',   border: 'border-gray-300',  gradient: 'from-gray-50 via-white to-gray-50'   },
  envoyee:      { label: 'Envoyée',      icon: Send,        color: '#EA580C', bg: 'bg-orange-100', border: 'border-orange-300', gradient: 'from-orange-50 via-white to-orange-50' },
  confirmee:    { label: 'Confirmée',    icon: CheckCircle, color: '#2072AF', bg: 'bg-blue-100',   border: 'border-blue-300',   gradient: 'from-blue-50 via-white to-blue-50'   },
  en_livraison: { label: 'En livraison', icon: Truck,       color: '#8B5CF6', bg: 'bg-purple-100', border: 'border-purple-300', gradient: 'from-purple-50 via-white to-purple-50' },
  livree:       { label: 'Livrée',       icon: CheckCircle, color: '#16A34A', bg: 'bg-green-100',  border: 'border-green-300',  gradient: 'from-green-50 via-white to-green-50'  },
};

type FilterType = 'all' | StatutCommande;

export function Commandes() {
  const { speak } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newStep, setNewStep] = useState(1);

  // Form nouvelle commande
  const [newProduit, setNewProduit] = useState('');
  const [newProduitImage, setNewProduitImage] = useState('');
  const [newQuantite, setNewQuantite] = useState('');
  const [newUnite, setNewUnite] = useState('kg');
  const [newProducteur, setNewProducteur] = useState('');
  const [newLocalisation, setNewLocalisation] = useState('');
  const [newDateLivraison, setNewDateLivraison] = useState('');
  const [newNombreMembres, setNewNombreMembres] = useState('');
  const [newPrixUnitaire, setNewPrixUnitaire] = useState('');

  const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);

  // Stats
  const stats = useMemo(() => ({
    total: commandes.length,
    brouillons: commandes.filter(c => c.statut === 'brouillon').length,
    enCours: commandes.filter(c => ['envoyee', 'confirmee', 'en_livraison'].includes(c.statut)).length,
    livrees: commandes.filter(c => c.statut === 'livree').length,
  }), [commandes]);

  // Filtrage — fonction unifiée
  const commandesFiltrees = useMemo(() => {
    return commandes.filter(c => {
      const match = matchesSearch(searchQuery, c.produit, c.producteur, c.localisation);
      const matchFilter = activeFilter === 'all' || c.statut === activeFilter;
      return match && matchFilter;
    });
  }, [commandes, searchQuery, activeFilter]);

  // Grouper par statut (ordre workflow)
  const grouped = useMemo(() => {
    const order: StatutCommande[] = ['brouillon', 'envoyee', 'confirmee', 'en_livraison', 'livree'];
    return order
      .map(s => ({ statut: s, items: commandesFiltrees.filter(c => c.statut === s) }))
      .filter(g => g.items.length > 0);
  }, [commandesFiltrees]);

  // Sync Bottom Bar
  useModalRegister(selectedCommande !== null || showNewModal);

  const doCreateCommande = () => {
    if (!newProduit || !newQuantite || !newProducteur || !newDateLivraison) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const montant = parseInt(newQuantite) * parseInt(newPrixUnitaire || '650');
    const nouvelle: Commande = {
      id: `new_${Date.now()}`,
      produit: newProduit,
      quantite: parseInt(newQuantite),
      unite: newUnite,
      nombreMembres: parseInt(newNombreMembres || '5'),
      producteur: newProducteur,
      localisation: newLocalisation || 'Abidjan',
      dateCreation: new Date().toISOString().split('T')[0],
      dateLivraison: newDateLivraison,
      statut: 'brouillon',
      montantTotal: montant,
    };
    setCommandes(prev => [nouvelle, ...prev]);
    toast.success(`Commande "${newProduit}" créée en brouillon`);
    speak(`Commande groupée pour ${newProduit} créée. En attente d'envoi.`);
    setShowNewModal(false);
    setNewStep(1);
    setNewProduit(''); setNewQuantite(''); setNewProducteur('');
    setNewLocalisation(''); setNewDateLivraison(''); setNewNombreMembres(''); setNewPrixUnitaire('');
  };

  const doProgressStatut = (c: Commande) => {
    const order: StatutCommande[] = ['brouillon', 'envoyee', 'confirmee', 'en_livraison', 'livree'];
    const idx = order.indexOf(c.statut);
    if (idx < order.length - 1) {
      const nextStatut = order[idx + 1];
      setCommandes(prev => prev.map(cmd => cmd.id === c.id ? { ...cmd, statut: nextStatut } : cmd));
      toast.success(`Commande passée en "${STATUT_CONFIG[nextStatut].label}"`);
      speak(`Statut mis à jour : ${STATUT_CONFIG[nextStatut].label}`);
      setSelectedCommande(null);
    }
  };

  return (
    <>
      {/* Header fixe — style Identificateur */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 bg-[#F5F0ED]"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">
              Commandes groupées
            </h1>
            <NotificationButton />
          </div>
        </div>
      </motion.div>

      {/* Contenu */}
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#F5F0ED] to-white">

        {/* KPI Cards — 3 colonnes style Identificateur */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Total */}
          <motion.button
            onClick={() => setActiveFilter('all')}
            className={`relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${activeFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-200'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Total</p>
              <motion.div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: C_LIGHT }}
                animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
              ><FileText className="w-5 h-5" style={{ color: C }} strokeWidth={2.5} /></motion.div>
            </div>
            <motion.p className="text-3xl font-bold" style={{ color: C }}
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
            >{stats.total}</motion.p>
            {activeFilter === 'all' && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full" style={{ backgroundColor: C }} />}
          </motion.button>

          {/* Brouillons */}
          <motion.button
            onClick={() => setActiveFilter('brouillon')}
            className={`relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${activeFilter === 'brouillon' ? 'border-gray-500 ring-2 ring-gray-300' : 'border-gray-300'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Brouillons</p>
              <motion.div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                animate={stats.brouillons > 0 ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
              ><Edit3 className="w-5 h-5 text-gray-600" strokeWidth={2.5} /></motion.div>
            </div>
            <motion.p className="text-3xl font-bold text-gray-700"
              animate={stats.brouillons > 0 ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
            >{stats.brouillons}</motion.p>
            {activeFilter === 'brouillon' && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-500 rounded-full" />}
          </motion.button>

          {/* Livrées */}
          <motion.button
            onClick={() => setActiveFilter('livree')}
            className={`relative bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${activeFilter === 'livree' ? 'border-green-500 ring-2 ring-green-300' : 'border-green-200'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Livrées</p>
              <motion.div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
                animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}
              ><CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5} /></motion.div>
            </div>
            <motion.p className="text-3xl font-bold text-green-600"
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
            >{stats.livrees}</motion.p>
            {activeFilter === 'livree' && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full" />}
          </motion.button>
        </div>

        {/* Boutons d'actions — style Identificateur */}
        <motion.div className="grid grid-cols-2 gap-3 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.button
            onClick={() => { setActiveFilter('all'); speak('Historique des commandes groupées'); }}
            className="flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#2072AF] transition-colors whitespace-nowrap"
            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          >
            <History className="w-5 h-5 flex-shrink-0" style={{ color: C }} />
            <span className="font-semibold text-gray-700">Commandes</span>
          </motion.button>
          <motion.button
            onClick={() => { setShowNewModal(true); setNewStep(1); speak('Créer une nouvelle commande groupée'); }}
            className="flex items-center justify-center gap-2 px-3 py-3.5 rounded-2xl text-white border-2 whitespace-nowrap"
            style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})`, borderColor: C }}
            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Nouvelle cmd</span>
          </motion.button>
        </motion.div>

        {/* Tabs workflow — style Identificateur */}
        <motion.div className="mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {([
                { id: 'all' as FilterType, label: 'Toutes', activeClass: `from-[${C}] to-[${C_DARK}]` },
                { id: 'brouillon' as FilterType, label: 'Brouillons', activeClass: 'from-gray-500 to-gray-700' },
                { id: 'envoyee' as FilterType, label: 'Envoyées', activeClass: 'from-orange-500 to-orange-600' },
                { id: 'confirmee' as FilterType, label: 'Confirmées', activeClass: 'from-blue-500 to-blue-700' },
                { id: 'en_livraison' as FilterType, label: 'Livraison', activeClass: 'from-purple-500 to-purple-700' },
                { id: 'livree' as FilterType, label: 'Livrées', activeClass: 'from-green-600 to-green-700' },
              ]).map(({ id, label, activeClass }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`relative flex-shrink-0 flex items-center justify-center px-4 py-3 rounded-xl font-bold text-xs transition-all ${activeFilter === id ? `bg-gradient-to-r ${activeClass} text-white shadow-md` : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher par produit, producteur..."
          />
        </motion.div>

        {/* Sections par statut — style Identificateur */}
        {commandesFiltrees.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <ShoppingBag className="w-14 h-14 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-semibold">Aucune commande trouvée</p>
            <p className="text-xs text-gray-400 mt-1">Créez votre première commande groupée</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ statut, items }) => {
              const cfg = STATUT_CONFIG[statut];
              const StatusIcon = cfg.icon;
              return (
                <div key={statut}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} />
                    <h2 className="font-bold text-gray-900 text-lg">{cfg.label}</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                    >{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {items.map((commande, index) => {
                        const StatIcon = STATUT_CONFIG[commande.statut].icon;
                        const statCfg = STATUT_CONFIG[commande.statut];
                        return (
                          <motion.div
                            key={commande.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.04 }}
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{ border: `2px solid ${statCfg.color}30` }}
                          >
                            <motion.div
                              className="p-4"
                              onClick={() => { setSelectedCommande(commande); speak(`Commande ${commande.produit}`); }}
                              style={{ backgroundColor: '#ffffff' }}
                              whileHover={{ backgroundColor: '#FAFAFA' }}
                            >
                              <div className="flex items-start gap-3">
                                {/* Avatar produit */}
                                <div
                                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                                  style={{ backgroundColor: `${statCfg.color}15`, borderColor: `${statCfg.color}40` }}
                                >
                                  <Package className="w-7 h-7" style={{ color: statCfg.color }} />
                                </div>

                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 text-base truncate">{commande.produit}</h3>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <div className="px-2 py-0.5 rounded-full text-xs font-bold"
                                      style={{ backgroundColor: `${C}15`, color: C }}
                                    >
                                      {commande.quantite} {commande.unite}
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold`}
                                      style={{ backgroundColor: `${statCfg.color}10`, color: statCfg.color, borderColor: `${statCfg.color}30` }}
                                    >
                                      <StatIcon className="w-3 h-3" />
                                      {statCfg.label}
                                    </div>
                                  </div>
                                  <div className="space-y-1 mt-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <span>{commande.nombreMembres} membres concernés</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span className="truncate">{commande.producteur} — {commande.localisation}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>Livraison le {new Date(commande.dateLivraison).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Montant */}
                                <div className="flex-shrink-0 text-right">
                                  <p className="font-black text-sm" style={{ color: C }}>
                                    {commande.montantTotal.toLocaleString('fr-FR')}
                                  </p>
                                  <p className="text-[10px] text-gray-400">FCFA</p>
                                  <ChevronRight className="w-4 h-4 text-gray-400 mt-2 ml-auto" />
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer détail commande */}
      <AnimatePresence>
        {selectedCommande && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end"
            onClick={() => setSelectedCommande(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-gray-300" />
              </div>

              {/* Header drawer */}
              <div className="px-5 pb-4 border-b border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                  style={{ backgroundColor: `${STATUT_CONFIG[selectedCommande.statut].color}15`, borderColor: `${STATUT_CONFIG[selectedCommande.statut].color}40` }}
                >
                  <Package className="w-7 h-7" style={{ color: STATUT_CONFIG[selectedCommande.statut].color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 text-lg truncate">{selectedCommande.produit}</h2>
                  <p className="text-sm text-gray-500">{selectedCommande.quantite} {selectedCommande.unite} — {selectedCommande.producteur}</p>
                  <div className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full border text-xs font-bold w-fit"
                    style={{ backgroundColor: `${STATUT_CONFIG[selectedCommande.statut].color}10`, color: STATUT_CONFIG[selectedCommande.statut].color, borderColor: `${STATUT_CONFIG[selectedCommande.statut].color}30` }}
                  >
                    {React.createElement(STATUT_CONFIG[selectedCommande.statut].icon, { className: 'w-3 h-3' })}
                    <span className="ml-1">{STATUT_CONFIG[selectedCommande.statut].label}</span>
                  </div>
                </div>
                <motion.button onClick={() => setSelectedCommande(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
                ><X className="w-4 h-4 text-gray-600" /></motion.button>
              </div>

              {/* Contenu drawer */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Workflow statuts */}
                <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Workflow commande</p>
                  <div className="flex items-center gap-1">
                    {(['brouillon', 'envoyee', 'confirmee', 'en_livraison', 'livree'] as StatutCommande[]).map((s, i, arr) => {
                      const cfg = STATUT_CONFIG[s];
                      const order = arr.indexOf(selectedCommande.statut);
                      const isDone = i <= order;
                      const isCurrent = s === selectedCommande.statut;
                      return (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center flex-shrink-0">
                            <motion.div
                              className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                              style={isDone ? { backgroundColor: cfg.color, borderColor: cfg.color } : { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' }}
                              animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              {React.createElement(cfg.icon, { className: 'w-4 h-4', style: { color: isDone ? '#fff' : '#9CA3AF' } })}
                            </motion.div>
                            <p className="text-[9px] font-bold mt-1 text-center leading-tight" style={{ color: isDone ? cfg.color : '#9CA3AF', maxWidth: 40 }}>{cfg.label}</p>
                          </div>
                          {i < arr.length - 1 && (
                            <div className="flex-1 h-0.5 mb-4 rounded-full" style={{ backgroundColor: i < order ? STATUT_CONFIG[arr[i]].color : '#E5E7EB' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Infos commande */}
                <div className="space-y-2">
                  {[
                    { icon: Package, label: 'Produit', value: `${selectedCommande.produit} — ${selectedCommande.quantite} ${selectedCommande.unite}` },
                    { icon: Users, label: 'Membres concernés', value: `${selectedCommande.nombreMembres} membres` },
                    { icon: MapPin, label: 'Producteur', value: `${selectedCommande.producteur} — ${selectedCommande.localisation}` },
                    { icon: Phone, label: 'Téléphone', value: selectedCommande.telephone || '+225 — —' },
                    { icon: Calendar, label: 'Date de création', value: new Date(selectedCommande.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
                    { icon: Calendar, label: 'Date de livraison', value: new Date(selectedCommande.dateLivraison).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
                    { icon: Wallet, label: 'Montant total', value: `${selectedCommande.montantTotal.toLocaleString('fr-FR')} FCFA` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-100 p-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C_LIGHT }}>
                        <Icon className="w-4 h-4" style={{ color: C }} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">{label}</p>
                        <p className="text-sm font-bold text-gray-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Wallet info */}
                <div className="p-4 rounded-2xl border-2" style={{ borderColor: `${C}30`, backgroundColor: `${C}08` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4" style={{ color: C }} />
                    <p className="text-xs font-bold" style={{ color: C }}>Paiement via Wallet Jùlaba</p>
                  </div>
                  <p className="text-xs text-gray-600">Le montant sera débité automatiquement du Wallet Jùlaba de la coopérative à la confirmation de livraison.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-4 border-t border-gray-100 bg-white">
                {selectedCommande.statut !== 'livree' && (
                  <motion.button
                    onClick={() => doProgressStatut(selectedCommande)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold"
                    style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                    {selectedCommande.statut === 'brouillon' ? 'Envoyer la commande' :
                     selectedCommande.statut === 'envoyee' ? 'Marquer comme confirmée' :
                     selectedCommande.statut === 'confirmee' ? 'Démarrer la livraison' :
                     'Confirmer la livraison'}
                  </motion.button>
                )}
                {selectedCommande.statut === 'livree' && (
                  <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-50 border-2 border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">Commande livrée avec succès</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nouvelle commande */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-gray-300" />
              </div>
              <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Nouvelle commande groupée</h2>
                  <p className="text-xs text-gray-500">Étape {newStep} sur 3</p>
                </div>
                <motion.button onClick={() => setShowNewModal(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90 }}
                ><X className="w-4 h-4 text-gray-600" /></motion.button>
              </div>

              {/* Barre progression */}
              <div className="px-5 pt-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(s => (
                    <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: C }}
                        animate={{ width: s <= newStep ? '100%' : '0%' }} transition={{ duration: 0.4 }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {['Produit', 'Producteur', 'Confirmation'].map((l, i) => (
                    <span key={l} className={`text-[10px] font-semibold ${i + 1 <= newStep ? 'text-blue-600' : 'text-gray-400'}`}>{l}</span>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Étape 1 : Produit */}
                {newStep === 1 && (
                  <>
                    <p className="text-sm text-gray-600">Renseignez les informations du produit commandé :</p>

                    <ImagePickerField
                      label="Photo du produit (facultatif)"
                      value={newProduitImage}
                      onChange={setNewProduitImage}
                      primaryColor={C}
                      shape="rect"
                      size={88}
                    />

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Nom du produit <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Ex: Riz local, Ignames, Tomates..."
                        value={newProduit} onChange={(e) => setNewProduit(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                        style={{ borderColor: newProduit ? C : undefined }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">Quantité <span className="text-red-500">*</span></label>
                        <input type="number" placeholder="Ex: 500"
                          value={newQuantite} onChange={(e) => setNewQuantite(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                          style={{ borderColor: newQuantite ? C : undefined }}
                        />
                      </div>
                      <SelectWithAutre
                        label="Unité"
                        value={newUnite}
                        onChange={setNewUnite}
                        options={['kg', 'tonnes', 'régimes', 'sacs', 'caisses', 'litre']}
                        primaryColor={C}
                        placeholder="Ex: barrique, carton..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">Prix unitaire (FCFA)</label>
                        <input type="number" placeholder="Ex: 650"
                          value={newPrixUnitaire} onChange={(e) => setNewPrixUnitaire(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">Nb membres</label>
                        <input type="number" placeholder="Ex: 10"
                          value={newNombreMembres} onChange={(e) => setNewNombreMembres(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                    {newQuantite && newPrixUnitaire && (
                      <div className="p-4 rounded-2xl border-2" style={{ borderColor: `${C}30`, backgroundColor: `${C}08` }}>
                        <p className="text-xs text-gray-500 mb-1">Montant estimé</p>
                        <p className="font-black text-xl" style={{ color: C }}>
                          {(parseInt(newQuantite) * parseInt(newPrixUnitaire)).toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Étape 2 : Producteur */}
                {newStep === 2 && (
                  <>
                    <p className="text-sm text-gray-600">Indiquez le producteur et la date de livraison souhaitée :</p>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Producteur <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Nom du producteur..."
                        value={newProducteur} onChange={(e) => setNewProducteur(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                        style={{ borderColor: newProducteur ? C : undefined }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Localisation</label>
                      <input type="text" placeholder="Ville / Zone..."
                        value={newLocalisation} onChange={(e) => setNewLocalisation(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Date de livraison souhaitée <span className="text-red-500">*</span></label>
                      <input type="date" value={newDateLivraison} onChange={(e) => setNewDateLivraison(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm bg-white"
                        style={{ borderColor: newDateLivraison ? C : undefined }}
                      />
                    </div>
                  </>
                )}

                {/* Étape 3 : Confirmation */}
                {newStep === 3 && (
                  <>
                    <div className="text-center py-4">
                      <motion.div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: C_LIGHT }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      ><ShoppingBag className="w-8 h-8" style={{ color: C }} /></motion.div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">Prête à créer la commande</h3>
                      <p className="text-sm text-gray-500">La commande sera créée en brouillon. Vous pourrez l'envoyer quand vous le souhaitez.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
                      {[
                        { label: 'Produit', value: `${newProduit} — ${newQuantite} ${newUnite}` },
                        { label: 'Producteur', value: `${newProducteur}${newLocalisation ? ` — ${newLocalisation}` : ''}` },
                        { label: 'Membres', value: `${newNombreMembres || '5'} membres` },
                        { label: 'Livraison', value: newDateLivraison ? new Date(newDateLivraison).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                        { label: 'Montant estimé', value: newQuantite && newPrixUnitaire ? `${(parseInt(newQuantite) * parseInt(newPrixUnitaire)).toLocaleString('fr-FR')} FCFA` : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-bold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">Le paiement via Wallet Jùlaba sera déclenché à la confirmation de la livraison.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                {newStep > 1 && (
                  <motion.button onClick={() => setNewStep(s => s - 1)}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  >Retour</motion.button>
                )}
                <motion.button
                  onClick={() => {
                    if (newStep < 3) {
                      if (newStep === 1 && (!newProduit || !newQuantite)) { toast.error('Renseignez le produit et la quantité'); return; }
                      if (newStep === 2 && (!newProducteur || !newDateLivraison)) { toast.error('Renseignez le producteur et la date'); return; }
                      setNewStep(s => s + 1);
                    } else {
                      doCreateCommande();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                >
                  {newStep === 3 ? (<><ShoppingBag className="w-4 h-4" /> Créer la commande</>) : (<>Suivant <ChevronRight className="w-4 h-4" /></>)}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation role="cooperative" />
    </>
  );
}