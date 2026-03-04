import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Plus,
  Search,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle,
  Clock,
  Wallet,
  AlertCircle,
  BarChart3,
  Truck,
  Banknote,
  Weight,
  Calendar,
  ArrowRight,
  Layers,
  RefreshCw,
  PauseCircle,
  Star,
  Volume2,
  Mic,
  MicOff,
  ChevronDown,
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';
import { toast } from 'sonner';

// ─── Couleurs ────────────────────────────────────────────────────────────────
const C = '#2072AF';
const C_DARK = '#1E5A8E';
const C_LIGHT = '#EBF4FB';

// ─── Types ───────────────────────────────────────────────────────────────────
type Statut = 'Collecting' | 'Negotiating' | 'Validated' | 'Paid' | 'Distributed';
type VueType = 'achats' | 'ventes';

interface MembreContrib {
  id: string;
  nom: string;
  quantite: number;
  paiement?: 'Paid' | 'Pending';
  receptionConfirmee?: boolean;
  dateParticipation: string;
}

interface Fournisseur {
  nom: string;
  prixUnitaire: number;
  delaiJours: number;
}

interface CommandeGroupee {
  id: string;
  type: VueType;
  produit: string;
  categorie: string;
  unite: string;
  statut: Statut;
  dateLimite: string;
  dateCreation: string;
  objectifKg: number;
  volumeActuel: number;
  prixUnitaireNegocie?: number;
  prixUnitaireMarche: number;
  membres: MembreContrib[];
  fournisseurs?: Fournisseur[];
  fournisseurChoisi?: string;
  historique: { statut: Statut; date: string }[];
  suspendue?: boolean;
}

// ─── Statuts config ───────────────────────────────────────────────────────────
const STATUT_CFG: Record<Statut, { label: string; color: string; bg: string; Icon: React.ElementType; next?: Statut }> = {
  Collecting:   { label: 'Collecte',      color: '#2072AF', bg: '#EBF4FB', Icon: Users,        next: 'Negotiating'  },
  Negotiating:  { label: 'Négociation',   color: '#EA580C', bg: '#FFF7ED', Icon: BarChart3,    next: 'Validated'    },
  Validated:    { label: 'Validé',        color: '#9333EA', bg: '#F5F3FF', Icon: CheckCircle,  next: 'Paid'         },
  Paid:         { label: 'Payé',          color: '#16A34A', bg: '#F0FDF4', Icon: Banknote,     next: 'Distributed'  },
  Distributed:  { label: 'Distribué',     color: '#6B7280', bg: '#F9FAFB', Icon: Truck,        next: undefined      },
};

const STATUTS_ORDRE: Statut[] = ['Collecting', 'Negotiating', 'Validated', 'Paid', 'Distributed'];

// ─── Données mock ─────────────────────────────────────────────────────────────
const mockCommandes: CommandeGroupee[] = [
  {
    id: '1', type: 'achats', produit: 'Riz local', categorie: 'Céréales', unite: 'kg', statut: 'Collecting',
    dateLimite: '2026-03-15', dateCreation: '2026-03-01',
    objectifKg: 2000, volumeActuel: 1350, prixUnitaireMarche: 620,
    membres: [
      { id: 'm1', nom: 'Kouassi Adjoua',   quantite: 400, dateParticipation: '2026-03-01' },
      { id: 'm2', nom: 'Traoré Mamadou',   quantite: 350, dateParticipation: '2026-03-02' },
      { id: 'm3', nom: 'Bamba Fatoumata',  quantite: 300, dateParticipation: '2026-03-03' },
      { id: 'm4', nom: 'Loba Adjoua',      quantite: 300, dateParticipation: '2026-03-04' },
    ],
    fournisseurs: [
      { nom: 'Agri-CI SARL',     prixUnitaire: 580, delaiJours: 5 },
      { nom: 'Coop Nord',        prixUnitaire: 595, delaiJours: 3 },
      { nom: 'GIE Bouaké Riz',   prixUnitaire: 570, delaiJours: 7 },
    ],
    historique: [{ statut: 'Collecting', date: '2026-03-01' }],
  },
  {
    id: '2', type: 'achats', produit: 'Engrais NPK', categorie: 'Intrants', unite: 'sac 50kg', statut: 'Negotiating',
    dateLimite: '2026-03-10', dateCreation: '2026-02-20',
    objectifKg: 100, volumeActuel: 100, prixUnitaireMarche: 18500, prixUnitaireNegocie: 16200,
    membres: [
      { id: 'm1', nom: 'Kouassi Adjoua',   quantite: 30, dateParticipation: '2026-02-20' },
      { id: 'm2', nom: 'Kone Ibrahim',     quantite: 25, dateParticipation: '2026-02-21' },
      { id: 'm3', nom: 'Diabaté Salimata', quantite: 20, dateParticipation: '2026-02-22' },
      { id: 'm4', nom: 'Zoro Jean-Bap.',   quantite: 25, dateParticipation: '2026-02-23' },
    ],
    fournisseurs: [
      { nom: 'PhytoChem CI',    prixUnitaire: 16200, delaiJours: 4 },
      { nom: 'AgroInput SARL',  prixUnitaire: 16800, delaiJours: 2 },
    ],
    fournisseurChoisi: 'PhytoChem CI',
    historique: [
      { statut: 'Collecting',  date: '2026-02-20' },
      { statut: 'Negotiating', date: '2026-03-10' },
    ],
  },
  {
    id: '3', type: 'achats', produit: 'Semences Maïs', categorie: 'Semences', unite: 'kg', statut: 'Paid',
    dateLimite: '2026-02-28', dateCreation: '2026-02-10',
    objectifKg: 500, volumeActuel: 500, prixUnitaireMarche: 2800, prixUnitaireNegocie: 2400,
    membres: [
      { id: 'm1', nom: 'Kouassi Adjoua',  quantite: 150, dateParticipation: '2026-02-10', paiement: 'Paid'    },
      { id: 'm2', nom: 'Traoré Mamadou',  quantite: 120, dateParticipation: '2026-02-11', paiement: 'Paid'    },
      { id: 'm3', nom: 'Loba Adjoua',     quantite: 130, dateParticipation: '2026-02-12', paiement: 'Paid'    },
      { id: 'm4', nom: 'Yao Kouakou',     quantite: 100, dateParticipation: '2026-02-13', paiement: 'Pending' },
    ],
    historique: [
      { statut: 'Collecting',  date: '2026-02-10' },
      { statut: 'Negotiating', date: '2026-02-22' },
      { statut: 'Validated',   date: '2026-02-25' },
      { statut: 'Paid',        date: '2026-02-28' },
    ],
  },
  {
    id: '4', type: 'ventes', produit: 'Ignames fraîches', categorie: 'Tubercules', unite: 'kg', statut: 'Collecting',
    dateLimite: '2026-03-18', dateCreation: '2026-03-03',
    objectifKg: 5000, volumeActuel: 2800, prixUnitaireMarche: 380,
    membres: [
      { id: 'm1', nom: 'Kouassi Adjoua',   quantite: 800,  dateParticipation: '2026-03-03' },
      { id: 'm2', nom: 'Kone Ibrahim',     quantite: 1200, dateParticipation: '2026-03-03' },
      { id: 'm3', nom: 'Bamba Fatoumata',  quantite: 800,  dateParticipation: '2026-03-04' },
    ],
    fournisseurs: [
      { nom: 'Marché Bouaké',    prixUnitaire: 400, delaiJours: 2 },
      { nom: 'Export-CI SARL',   prixUnitaire: 420, delaiJours: 5 },
    ],
    historique: [{ statut: 'Collecting', date: '2026-03-03' }],
  },
  {
    id: '5', type: 'ventes', produit: 'Cacao séché', categorie: 'Cultures de rente', unite: 'kg', statut: 'Distributed',
    dateLimite: '2026-02-15', dateCreation: '2026-01-20',
    objectifKg: 3000, volumeActuel: 3000, prixUnitaireMarche: 1800, prixUnitaireNegocie: 2050,
    membres: [
      { id: 'm1', nom: 'Diabaté Salimata',  quantite: 1000, dateParticipation: '2026-01-20', paiement: 'Paid', receptionConfirmee: true },
      { id: 'm2', nom: 'Zoro Jean-Bap.',    quantite: 1200, dateParticipation: '2026-01-21', paiement: 'Paid', receptionConfirmee: true },
      { id: 'm3', nom: 'Coulibaly Arouna',  quantite: 800,  dateParticipation: '2026-01-22', paiement: 'Paid', receptionConfirmee: true },
    ],
    historique: [
      { statut: 'Collecting',  date: '2026-01-20' },
      { statut: 'Negotiating', date: '2026-02-01' },
      { statut: 'Validated',   date: '2026-02-08' },
      { statut: 'Paid',        date: '2026-02-12' },
      { statut: 'Distributed', date: '2026-02-15' },
    ],
  },
];

const CATEGORIES = ['Tous', 'Céréales', 'Légumes', 'Tubercules', 'Semences', 'Intrants', 'Cultures de rente'];

// ─── Badge statut ─────────────────────────────────────────────────────────────
function BadgeStatut({ statut }: { statut: Statut }) {
  const cfg = STATUT_CFG[statut];
  const Icon = cfg.Icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: `${cfg.color}30` }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Stepper statut ────────────────────────────────────────────────────────────
function StepperStatut({ statut }: { statut: Statut }) {
  const idx = STATUTS_ORDRE.indexOf(statut);
  return (
    <div className="flex items-center gap-1 w-full">
      {STATUTS_ORDRE.map((s, i) => {
        const cfg = STATUT_CFG[s];
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all"
                style={{
                  backgroundColor: done || active ? cfg.color : '#F3F4F6',
                  borderColor: done || active ? cfg.color : '#E5E7EB',
                }}
              >
                {done
                  ? <Check className="w-3.5 h-3.5 text-white" />
                  : <cfg.Icon className="w-3.5 h-3.5" style={{ color: active ? 'white' : '#9CA3AF' }} />
                }
              </div>
              <p className="text-[9px] text-center" style={{ color: active ? cfg.color : done ? '#6B7280' : '#D1D5DB', maxWidth: 40 }}>{cfg.label}</p>
            </div>
            {i < STATUTS_ORDRE.length - 1 && (
              <div className="flex-1 h-0.5 rounded-full mb-4" style={{ backgroundColor: i < idx ? '#16A34A' : '#E5E7EB' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function MarcheCooperative() {
  const { speak, setIsModalOpen } = useApp();
  const [vue, setVue] = useState<VueType>('achats');
  const [commandes, setCommandes] = useState<CommandeGroupee[]>(mockCommandes);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('Tous');
  const [filterStatut, setFilterStatut] = useState<Statut | 'Tous'>('Tous');
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // ── Modal détail ──
  const [selected, setSelected] = useState<CommandeGroupee | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'membres' | 'historique'>('info');

  // ── Modal créer ──
  const [showCreer, setShowCreer] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newCmd, setNewCmd] = useState({
    produit: '', categorie: 'Céréales', unite: 'kg',
    objectifKg: '', prixUnitaireMarche: '', dateLimite: '',
  });

  // ── Modal actions ──
  const [showPasserStatut, setShowPasserStatut] = useState(false);
  const [showSuspendre, setShowSuspendre] = useState(false);
  const [showParticiper, setShowParticiper] = useState(false);
  const [showPaiement, setShowPaiement] = useState(false);
  const [showReception, setShowReception] = useState(false);
  const [showFournisseur, setShowFournisseur] = useState(false);
  const [qtParticipation, setQtParticipation] = useState('');
  const [prixNegocie, setPrixNegocie] = useState('');
  const [fournisseurChoisi, setFournisseurChoisi] = useState('');
  const [membresPaiement, setMembresPaiement] = useState<string[]>([]);

  // ── Synchronisation Bottom Bar ──────────────────────────────────────────
  useEffect(() => {
    const anyModalOpen =
      selected !== null ||
      showCreer ||
      showPasserStatut ||
      showSuspendre ||
      showParticiper ||
      showPaiement ||
      showReception ||
      showFournisseur;
    setIsModalOpen(anyModalOpen);
  }, [selected, showCreer, showPasserStatut, showSuspendre, showParticiper,
      showPaiement, showReception, showFournisseur, setIsModalOpen]);

  // Nettoyage à la destruction du composant
  useEffect(() => () => { setIsModalOpen(false); }, [setIsModalOpen]);

  // ─── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const actives = commandes.filter(c => c.type === vue && c.statut !== 'Distributed' && !c.suspendue);
    const distribues = commandes.filter(c => c.type === vue && c.statut === 'Distributed');
    const totalVol = actives.reduce((s, c) => s + c.volumeActuel, 0);
    const economies = commandes
      .filter(c => c.type === 'achats' && c.prixUnitaireNegocie)
      .reduce((s, c) => s + (c.prixUnitaireMarche - c.prixUnitaireNegocie!) * c.volumeActuel, 0);
    const revenus = commandes
      .filter(c => c.type === 'ventes' && c.prixUnitaireNegocie)
      .reduce((s, c) => s + c.prixUnitaireNegocie! * c.volumeActuel, 0);
    return { actives: actives.length, distribues: distribues.length, totalVol, economies, revenus };
  }, [commandes, vue]);

  // ─── Filtrage ────────────────────────────────────────────────────────────
  const filtrees = useMemo(() => {
    return commandes.filter(c => {
      if (c.type !== vue) return false;
      if (searchQuery && !c.produit.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCat !== 'Tous' && c.categorie !== filterCat) return false;
      if (filterStatut !== 'Tous' && c.statut !== filterStatut) return false;
      return true;
    });
  }, [commandes, vue, searchQuery, filterCat, filterStatut]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const passerStatut = () => {
    if (!selected) return;
    const cfg = STATUT_CFG[selected.statut];
    if (!cfg.next) return;

    // Règles métier
    if (selected.statut === 'Collecting' && new Date(selected.dateLimite) > new Date()) {
      toast.error('La date limite de collecte n\'est pas encore atteinte');
      return;
    }
    if (selected.statut === 'Negotiating' && selected.volumeActuel < selected.objectifKg * 0.7) {
      toast.error('Volume minimum non atteint (70% requis)');
      return;
    }
    if (selected.statut === 'Validated') {
      const nonPaies = selected.membres.filter(m => m.paiement === 'Pending');
      if (nonPaies.length > 0) {
        toast.error(`${nonPaies.length} membre(s) n'ont pas encore payé`);
        return;
      }
    }
    if (selected.statut === 'Paid') {
      const nonRecus = selected.membres.filter(m => !m.receptionConfirmee);
      if (nonRecus.length > 0) {
        toast.error(`${nonRecus.length} membre(s) n'ont pas confirmé la réception`);
        return;
      }
    }

    const next = cfg.next!;
    setCommandes(prev => prev.map(c => c.id === selected.id
      ? { ...c, statut: next, historique: [...c.historique, { statut: next, date: new Date().toISOString().split('T')[0] }] }
      : c
    ));
    const updated = { ...selected, statut: next };
    setSelected(updated);
    toast.success(`Commande passée en statut "${STATUT_CFG[next].label}"`);
    speak(`La commande ${selected.produit} est maintenant en statut ${STATUT_CFG[next].label}`);
    setShowPasserStatut(false);
  };

  const suspendre = () => {
    if (!selected) return;
    setCommandes(prev => prev.map(c => c.id === selected.id ? { ...c, suspendue: !c.suspendue } : c));
    const action = selected.suspendue ? 'réactivée' : 'suspendue';
    toast.success(`Commande ${action}`);
    setSelected(null);
    setShowSuspendre(false);
  };

  const participer = () => {
    if (!selected || !qtParticipation) { toast.error('Indiquez une quantité'); return; }
    const qt = parseInt(qtParticipation);
    const nouveauMembre: MembreContrib = {
      id: `nm_${Date.now()}`, nom: 'Moi (Gestionnaire)',
      quantite: qt, dateParticipation: new Date().toISOString().split('T')[0],
    };
    setCommandes(prev => prev.map(c => c.id === selected.id
      ? { ...c, volumeActuel: c.volumeActuel + qt, membres: [...c.membres, nouveauMembre] }
      : c
    ));
    toast.success(`Participation de ${qt} ${selected.unite} enregistrée`);
    speak(`Votre participation de ${qt} ${selected.unite} a été ajoutée`);
    setShowParticiper(false);
    setQtParticipation('');
    setSelected(null);
  };

  const validerFournisseur = () => {
    if (!selected || !fournisseurChoisi || !prixNegocie) { toast.error('Remplissez tous les champs'); return; }
    setCommandes(prev => prev.map(c => c.id === selected.id
      ? { ...c, fournisseurChoisi, prixUnitaireNegocie: parseInt(prixNegocie) }
      : c
    ));
    toast.success(`Fournisseur "${fournisseurChoisi}" sélectionné à ${parseInt(prixNegocie).toLocaleString('fr-FR')} FCFA/${selected.unite}`);
    setShowFournisseur(false);
    setFournisseurChoisi('');
    setPrixNegocie('');
  };

  const confirmerPaiements = () => {
    if (!selected || membresPaiement.length === 0) { toast.error('Sélectionnez au moins un membre'); return; }
    setCommandes(prev => prev.map(c => c.id === selected.id
      ? { ...c, membres: c.membres.map(m => membresPaiement.includes(m.id) ? { ...m, paiement: 'Paid' as const } : m) }
      : c
    ));
    toast.success(`${membresPaiement.length} paiement(s) confirmé(s) via Wallet Jùlaba`);
    speak(`${membresPaiement.length} paiements confirmés`);
    setShowPaiement(false);
    setMembresPaiement([]);
    setSelected(null);
  };

  const confirmerReception = (membreId: string) => {
    if (!selected) return;
    setCommandes(prev => prev.map(c => c.id === selected.id
      ? { ...c, membres: c.membres.map(m => m.id === membreId ? { ...m, receptionConfirmee: true } : m) }
      : c
    ));
    toast.success('Réception confirmée');
  };

  const creerCommande = () => {
    if (!newCmd.produit || !newCmd.objectifKg || !newCmd.dateLimite) {
      toast.error('Remplissez tous les champs obligatoires');
      return;
    }
    const cmd: CommandeGroupee = {
      id: `cmd_${Date.now()}`, type: vue,
      produit: newCmd.produit, categorie: newCmd.categorie, unite: newCmd.unite,
      statut: 'Collecting',
      dateLimite: newCmd.dateLimite, dateCreation: new Date().toISOString().split('T')[0],
      objectifKg: parseInt(newCmd.objectifKg),
      volumeActuel: 0,
      prixUnitaireMarche: parseInt(newCmd.prixUnitaireMarche) || 0,
      membres: [],
      historique: [{ statut: 'Collecting', date: new Date().toISOString().split('T')[0] }],
    };
    setCommandes(prev => [cmd, ...prev]);
    toast.success(`Commande groupée "${newCmd.produit}" créée`);
    speak(`Nouvelle commande groupée ${newCmd.produit} créée. La collecte commence maintenant.`);
    setShowCreer(false);
    setCreateStep(1);
    setNewCmd({ produit: '', categorie: 'Céréales', unite: 'kg', objectifKg: '', prixUnitaireMarche: '', dateLimite: '' });
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('Reconnaissance vocale non disponible'); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'fr-FR'; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => { setSearchQuery(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const voiceLecture = () => {
    const msg = `Mode ${vue === 'achats' ? 'achats groupés' : 'ventes groupées'}. ${kpis.actives} commandes actives, ${(kpis.totalVol / 1000).toFixed(1)} tonnes en cours.`;
    speak(msg);
    toast.info('Tantie Sagesse parle...');
  };

  // ─── Carte commande — ultra simple et explicite ───────────────────────────
  const renderCarte = (cmd: CommandeGroupee, index: number) => {
    const cfg = STATUT_CFG[cmd.statut];
    const StatutIcon = cfg.Icon;
    const progression = Math.min(100, Math.round((cmd.volumeActuel / cmd.objectifKg) * 100));
    const joursRestants = Math.max(0, Math.ceil((new Date(cmd.dateLimite).getTime() - Date.now()) / 86400000));
    const economie = cmd.prixUnitaireNegocie
      ? (cmd.prixUnitaireMarche - cmd.prixUnitaireNegocie) * cmd.volumeActuel
      : 0;
    const urgente = cmd.statut === 'Collecting' && joursRestants <= 3;

    return (
      <motion.div
        key={cmd.id}
        layout
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.06, type: 'spring', stiffness: 220, damping: 22 }}
        className={`bg-white rounded-3xl border-2 shadow-md cursor-pointer overflow-hidden ${cmd.suspendue ? 'opacity-55' : ''}`}
        style={{ borderColor: `${cfg.color}40` }}
        whileHover={{ y: -4, boxShadow: `0 16px 40px ${cfg.color}22` }}
        whileTap={{ scale: 0.97 }}
        onClick={() => { setSelected(cmd); setDetailTab('info'); }}
      >
        {/* Bandeau statut en haut — couleur pleine */}
        {/* Bandeau statut — texte base, icône w-5 */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: cfg.color }}
        >
          <div className="flex items-center gap-2">
            <StatutIcon className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-base">{cfg.label}</span>
          </div>
          {cmd.suspendue && (
            <div className="flex items-center gap-1.5 bg-white/25 rounded-full px-3 py-1">
              <PauseCircle className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">Suspendue</span>
            </div>
          )}
          {urgente && !cmd.suspendue && (
            <motion.div
              className="flex items-center gap-1.5 bg-white/25 rounded-full px-3 py-1"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">Urgent !</span>
            </motion.div>
          )}
        </div>

        <div className="p-3">
          {/* Nom du produit */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cfg.bg }}
            >
              <Package className="w-6 h-6" style={{ color: cfg.color }} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-xl leading-tight">{cmd.produit}</p>
              <p className="text-sm font-medium text-gray-600">{cmd.categorie} · {cmd.unite}</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-bold text-gray-800">Volume collecté</span>
              <span className="text-base font-bold" style={{ color: cfg.color }}>{progression}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{ backgroundColor: cfg.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progression}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: index * 0.06 }}
              >
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 1.2 }}
                />
              </motion.div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-sm font-bold text-gray-800">{cmd.volumeActuel.toLocaleString('fr-FR')} {cmd.unite}</span>
              <span className="text-sm font-medium text-gray-600">sur {cmd.objectifKg.toLocaleString('fr-FR')} {cmd.unite}</span>
            </div>
          </div>

          {/* 3 tuiles — chiffres gros, labels text-sm foncé */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-2xl py-2.5 px-1 text-center border-2 border-gray-200 bg-gray-50">
              <Users className="w-5 h-5 mx-auto mb-1" style={{ color: C }} />
              <p className="text-2xl font-bold text-gray-900 leading-none">{cmd.membres.length}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">membres</p>
            </div>

            <div
              className="rounded-2xl py-2.5 px-1 text-center border-2"
              style={urgente
                ? { backgroundColor: '#FFF7ED', borderColor: '#F97316' }
                : { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' }}
            >
              <Clock className="w-5 h-5 mx-auto mb-1" style={{ color: urgente ? '#EA580C' : '#6B7280' }} />
              <p className="text-2xl font-bold leading-none" style={{ color: urgente ? '#C2410C' : '#111827' }}>
                {cmd.statut === 'Collecting'
                  ? joursRestants
                  : cmd.prixUnitaireNegocie ? `${Math.round(cmd.prixUnitaireNegocie / 1000)}k` : '--'}
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: urgente ? '#C2410C' : '#4B5563' }}>
                {cmd.statut === 'Collecting' ? 'jours' : 'FCFA/kg'}
              </p>
            </div>

            <div className="rounded-2xl py-2.5 px-1 text-center border-2 border-green-300 bg-green-50">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-700" />
              <p className="text-2xl font-bold text-green-800 leading-none">
                {economie > 0
                  ? `${Math.round(economie / 1000)}k`
                  : cmd.volumeActuel >= 1000 ? `${(cmd.volumeActuel / 1000).toFixed(1)}t` : cmd.volumeActuel}
              </p>
              <p className="text-sm font-semibold text-green-800 mt-1">
                {economie > 0 ? 'FCFA gain' : cmd.volumeActuel >= 1000 ? 'tonnes' : cmd.unite}
              </p>
            </div>
          </div>

          {/* Bouton CTA — fond plein + texte blanc = contraste maximum */}
          <motion.button
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base text-white"
            style={{ backgroundColor: cfg.color }}
            whileTap={{ scale: 0.97 }}
          >
            <StatutIcon className="w-5 h-5 text-white" />
            <span>Voir les détails</span>
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // ─── Modal détail ─────────────────────────────────────────────────────────
  const renderDetailModal = () => {
    if (!selected) return null;
    const cfg = STATUT_CFG[selected.statut];
    const progression = Math.min(100, Math.round((selected.volumeActuel / selected.objectifKg) * 100));
    const totalCommande = (selected.prixUnitaireNegocie || selected.prixUnitaireMarche) * selected.volumeActuel;
    const canNext = !!cfg.next && !selected.suspendue;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full max-h-[94vh] flex flex-col overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 flex items-start justify-between gap-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                  <Package className="w-6 h-6" style={{ color: cfg.color }} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{selected.produit}</h2>
                  <BadgeStatut statut={selected.statut} />
                </div>
              </div>
              <motion.button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1" whileHover={{ rotate: 90 }}>
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Stepper */}
            <div className="px-5 py-3 border-b border-gray-100">
              <StepperStatut statut={selected.statut} />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50">
              {([
                { id: 'info', label: 'Détails' },
                { id: 'membres', label: `Membres (${selected.membres.length})` },
                { id: 'historique', label: 'Historique' },
              ] as const).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setDetailTab(id)}
                  className="flex-1 py-3 text-xs font-bold border-b-2 transition-all"
                  style={detailTab === id ? { borderBottomColor: cfg.color, color: cfg.color } : { borderBottomColor: 'transparent', color: '#6B7280' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-5 pb-4 space-y-4">

              {detailTab === 'info' && (
                <>
                  {/* Progression */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-600">Volume collecté</span>
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>{progression}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: cfg.color }}
                        initial={{ width: 0 }} animate={{ width: `${progression}%` }} transition={{ duration: 1 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{selected.volumeActuel.toLocaleString('fr-FR')} {selected.unite}</span>
                      <span>Objectif: {selected.objectifKg.toLocaleString('fr-FR')} {selected.unite}</span>
                    </div>
                  </div>

                  {/* Infos grille */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { Icon: Calendar, label: 'Date limite', val: new Date(selected.dateLimite).toLocaleDateString('fr-FR'), color: '#EA580C' },
                      { Icon: Users, label: 'Membres', val: `${selected.membres.length} participants`, color: C },
                      { Icon: Banknote, label: selected.prixUnitaireNegocie ? 'Prix négocié' : 'Prix marché', val: `${(selected.prixUnitaireNegocie || selected.prixUnitaireMarche).toLocaleString('fr-FR')} FCFA`, color: '#16A34A' },
                      { Icon: Weight, label: 'Total commande', val: `${totalCommande.toLocaleString('fr-FR')} FCFA`, color: '#9333EA' },
                    ].map(({ Icon, label, val, color }) => (
                      <div key={label} className="bg-gray-50 rounded-2xl border border-gray-100 p-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <p className="text-[10px] text-gray-500">{label}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Fournisseurs si Negotiating */}
                  {selected.statut === 'Negotiating' && selected.fournisseurs && (
                    <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-orange-800">Fournisseurs comparés</p>
                        <motion.button
                          onClick={() => setShowFournisseur(true)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-600 text-white"
                          whileTap={{ scale: 0.95 }}
                        >
                          Choisir
                        </motion.button>
                      </div>
                      {selected.fournisseurs.map(f => (
                        <div key={f.nom} className={`flex items-center justify-between py-2 border-b border-orange-100 last:border-0 ${selected.fournisseurChoisi === f.nom ? 'font-bold text-orange-700' : ''}`}>
                          <div className="flex items-center gap-2">
                            {selected.fournisseurChoisi === f.nom && <Star className="w-3.5 h-3.5 text-orange-500" />}
                            <span className="text-sm">{f.nom}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{f.prixUnitaire.toLocaleString('fr-FR')} FCFA</p>
                            <p className="text-[10px] text-gray-400">{f.delaiJours}j de livraison</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Paiements si Paid */}
                  {selected.statut === 'Paid' && (
                    <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-green-800">Paiements Wallet Jùlaba</p>
                        <motion.button
                          onClick={() => setShowPaiement(true)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-green-600 text-white"
                          whileTap={{ scale: 0.95 }}
                        >
                          Confirmer
                        </motion.button>
                      </div>
                      {selected.membres.map(m => (
                        <div key={m.id} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
                          <span className="text-sm">{m.nom}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.paiement === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {m.paiement === 'Paid' ? 'Payé' : 'En attente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Distribution si Distributed */}
                  {(selected.statut === 'Distributed' || selected.statut === 'Paid') && (
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                      <p className="text-xs font-bold text-gray-700 mb-3">Confirmation réception</p>
                      {selected.membres.map(m => (
                        <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{m.nom}</p>
                            <p className="text-xs text-gray-400">{m.quantite} {selected.unite}</p>
                          </div>
                          {m.receptionConfirmee
                            ? <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" />Reçu</span>
                            : <motion.button onClick={() => confirmerReception(m.id)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-600 text-white"
                                whileTap={{ scale: 0.95 }}>
                                Confirmer
                              </motion.button>
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {detailTab === 'membres' && (
                <div className="space-y-2">
                  {selected.membres.length === 0
                    ? <div className="text-center py-10 text-gray-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-40" /><p className="text-sm">Aucun membre encore</p></div>
                    : selected.membres.map(m => (
                      <div key={m.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}>
                          {m.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{m.nom}</p>
                          <p className="text-xs text-gray-400">{new Date(m.dateParticipation).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">{m.quantite} {selected.unite}</p>
                          {m.paiement && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${m.paiement === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {m.paiement === 'Paid' ? 'Payé' : 'En attente'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {detailTab === 'historique' && (
                <div className="space-y-2">
                  {[...selected.historique].reverse().map((h, i) => {
                    const hcfg = STATUT_CFG[h.statut];
                    return (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-100 p-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: hcfg.bg }}>
                          <hcfg.Icon className="w-4 h-4" style={{ color: hcfg.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Passage en {hcfg.label}</p>
                          <p className="text-xs text-gray-400">{new Date(h.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions bas */}
            {!selected.suspendue && (
              <div className="px-5 py-4 border-t border-gray-100 space-y-2 bg-white">
                {selected.statut === 'Collecting' && (
                  <motion.button onClick={() => setShowParticiper(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold"
                    style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                    <Plus className="w-5 h-5" /> Ajouter ma participation
                  </motion.button>
                )}
                {canNext && (
                  <motion.button onClick={() => setShowPasserStatut(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold border-2"
                    style={{ color: STATUT_CFG[cfg.next!].color, borderColor: STATUT_CFG[cfg.next!].color, backgroundColor: STATUT_CFG[cfg.next!].bg }}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                    <ArrowRight className="w-5 h-5" /> Passer en {STATUT_CFG[cfg.next!].label}
                  </motion.button>
                )}
                <motion.button onClick={() => setShowSuspendre(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm"
                  whileTap={{ scale: 0.97 }}>
                  <PauseCircle className="w-4 h-4" /> Suspendre la commande
                </motion.button>
              </div>
            )}
            {selected.suspendue && (
              <div className="px-5 py-4 border-t border-gray-100 bg-white">
                <motion.button onClick={suspendre}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-green-600 text-white font-bold"
                  whileTap={{ scale: 0.97 }}>
                  <RefreshCw className="w-5 h-5" /> Réactiver la commande
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── Modal Passer statut ──────────────────────────────────────────────────
  const renderPasserStatutModal = () => {
    if (!selected || !showPasserStatut) return null;
    const next = STATUT_CFG[selected.statut].next!;
    const ncfg = STATUT_CFG[next];
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: ncfg.bg }}>
                <ncfg.Icon className="w-6 h-6" style={{ color: ncfg.color }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Confirmer le passage</h3>
                <p className="text-xs text-gray-500">Vers le statut <span className="font-bold" style={{ color: ncfg.color }}>{ncfg.label}</span></p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              La commande <span className="font-bold">{selected.produit}</span> passera en <span className="font-bold" style={{ color: ncfg.color }}>{ncfg.label}</span>. Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <motion.button onClick={() => setShowPasserStatut(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm" whileTap={{ scale: 0.97 }}>Annuler</motion.button>
              <motion.button onClick={passerStatut} className="flex-1 py-3 rounded-2xl text-white font-bold text-sm" style={{ backgroundColor: ncfg.color }} whileTap={{ scale: 0.97 }}>Confirmer</motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── Modal Participer ─────────────────────────────────────────────────────
  const renderParticiperModal = () => {
    if (!selected || !showParticiper) return null;
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: C_LIGHT }}>
                <Plus className="w-6 h-6" style={{ color: C }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Participer</h3>
                <p className="text-xs text-gray-500">{selected.produit}</p>
              </div>
            </div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Quantité ({selected.unite}) *</label>
            <input type="number" placeholder={`Ex: 100 ${selected.unite}`} value={qtParticipation}
              onChange={e => setQtParticipation(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm mb-4"
              style={{ borderColor: qtParticipation ? C : undefined }} />
            <div className="bg-blue-50 rounded-2xl p-3 mb-5 text-xs text-blue-800">
              Volume actuel : <span className="font-bold">{selected.volumeActuel} {selected.unite}</span> / Objectif : <span className="font-bold">{selected.objectifKg} {selected.unite}</span>
            </div>
            <div className="flex gap-2">
              <motion.button onClick={() => { setShowParticiper(false); setQtParticipation(''); }} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm" whileTap={{ scale: 0.97 }}>Annuler</motion.button>
              <motion.button onClick={participer} className="flex-1 py-3 rounded-2xl text-white font-bold text-sm" style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }} whileTap={{ scale: 0.97 }}>Confirmer</motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── Modal Fournisseur ────────────────────────────────────────────────────
  const renderFournisseurModal = () => {
    if (!selected || !showFournisseur) return null;
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Choisir le fournisseur</h3>
            <div className="space-y-2 mb-4">
              {selected.fournisseurs?.map(f => (
                <motion.div key={f.nom} onClick={() => { setFournisseurChoisi(f.nom); setPrixNegocie(String(f.prixUnitaire)); }}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${fournisseurChoisi === f.nom ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}
                  whileTap={{ scale: 0.98 }}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 text-sm">{f.nom}</p>
                    {fournisseurChoisi === f.nom && <CheckCircle className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span className="font-bold text-gray-900">{f.prixUnitaire.toLocaleString('fr-FR')} FCFA/{selected.unite}</span>
                    <span>{f.delaiJours}j livraison</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Prix négocié final (FCFA/{selected.unite})</label>
            <input type="number" value={prixNegocie} onChange={e => setPrixNegocie(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm mb-4" />
            <div className="flex gap-2">
              <motion.button onClick={() => setShowFournisseur(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm" whileTap={{ scale: 0.97 }}>Annuler</motion.button>
              <motion.button onClick={validerFournisseur} className="flex-1 py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm" whileTap={{ scale: 0.97 }}>Valider</motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── Modal Paiement ───────────────────────────────────────────────────────
  const renderPaiementModal = () => {
    if (!selected || !showPaiement) return null;
    const pending = selected.membres.filter(m => m.paiement === 'Pending');
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Paiement Wallet Jùlaba</h3>
                <p className="text-xs text-gray-500">{pending.length} membre(s) en attente</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {pending.map(m => {
                const montant = (selected.prixUnitaireNegocie || selected.prixUnitaireMarche) * m.quantite;
                const checked = membresPaiement.includes(m.id);
                return (
                  <motion.div key={m.id} onClick={() => setMembresPaiement(prev => checked ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                    className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-3 ${checked ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                    whileTap={{ scale: 0.98 }}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{m.nom}</p>
                      <p className="text-xs text-gray-400">{m.quantite} {selected.unite} — {montant.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <motion.button onClick={() => { setShowPaiement(false); setMembresPaiement([]); }} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm" whileTap={{ scale: 0.97 }}>Annuler</motion.button>
              <motion.button onClick={confirmerPaiements} className="flex-1 py-3 rounded-2xl bg-green-600 text-white font-bold text-sm" whileTap={{ scale: 0.97 }}>Confirmer paiement</motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── Modal Suspendre ──────────────────────────────────────────────────────
  const renderSuspendreModal = () => {
    if (!selected || !showSuspendre) return null;
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <PauseCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Suspendre la commande ?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">La commande <span className="font-bold">{selected.produit}</span> sera suspendue. Vous pourrez la réactiver à tout moment.</p>
            <div className="flex gap-2">
              <motion.button onClick={() => setShowSuspendre(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm" whileTap={{ scale: 0.97 }}>Annuler</motion.button>
              <motion.button onClick={suspendre} className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm" whileTap={{ scale: 0.97 }}>Suspendre</motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── Modal Créer commande ─────────────────────────────────────────────────
  const renderCreerModal = () => {
    if (!showCreer) return null;
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setShowCreer(false)}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>
            <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Nouvelle commande groupée</h2>
                <p className="text-xs text-gray-500">{vue === 'achats' ? 'Achat groupé' : 'Vente groupée'} — Étape {createStep}/2</p>
              </div>
              <motion.button onClick={() => { setShowCreer(false); setCreateStep(1); }} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileHover={{ rotate: 90 }}>
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Barre progression */}
            <div className="px-5 pt-3">
              <div className="flex gap-1.5">
                {[1, 2].map(s => (
                  <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: C }}
                      animate={{ width: s <= createStep ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {createStep === 1 && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Produit *</label>
                    <input type="text" placeholder="Ex: Riz local, Engrais NPK..." value={newCmd.produit}
                      onChange={e => setNewCmd(p => ({ ...p, produit: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                      style={{ borderColor: newCmd.produit ? C : undefined }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Catégorie</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORIES.filter(c => c !== 'Tous').map(cat => (
                        <motion.button key={cat} onClick={() => setNewCmd(p => ({ ...p, categorie: cat }))}
                          className={`py-2 rounded-xl border-2 text-xs font-bold ${newCmd.categorie === cat ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                          style={newCmd.categorie === cat ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : {}}
                          whileTap={{ scale: 0.95 }}>
                          {cat}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Unité</label>
                      <select value={newCmd.unite} onChange={e => setNewCmd(p => ({ ...p, unite: e.target.value }))}
                        className="w-full px-3 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm bg-white">
                        {['kg', 'tonne', 'sac 50kg', 'carton', 'litre', 'unité'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2">Prix marché (FCFA)</label>
                      <input type="number" placeholder="Ex: 620" value={newCmd.prixUnitaireMarche}
                        onChange={e => setNewCmd(p => ({ ...p, prixUnitaireMarche: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm" />
                    </div>
                  </div>
                </>
              )}
              {createStep === 2 && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Volume objectif ({newCmd.unite}) *</label>
                    <input type="number" placeholder="Ex: 2000" value={newCmd.objectifKg}
                      onChange={e => setNewCmd(p => ({ ...p, objectifKg: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                      style={{ borderColor: newCmd.objectifKg ? C : undefined }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Date limite de participation *</label>
                    <input type="date" value={newCmd.dateLimite}
                      onChange={e => setNewCmd(p => ({ ...p, dateLimite: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none text-sm"
                      style={{ borderColor: newCmd.dateLimite ? C : undefined }} />
                  </div>
                  {/* Récapitulatif */}
                  <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-2">
                    <p className="text-xs font-bold text-blue-800">Récapitulatif</p>
                    {[
                      ['Produit', newCmd.produit || '—'],
                      ['Catégorie', newCmd.categorie],
                      ['Unité', newCmd.unite],
                      ['Volume objectif', newCmd.objectifKg ? `${newCmd.objectifKg} ${newCmd.unite}` : '—'],
                      ['Date limite', newCmd.dateLimite ? new Date(newCmd.dateLimite).toLocaleDateString('fr-FR') : '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-bold text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              {createStep > 1 && (
                <motion.button onClick={() => setCreateStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
                  whileTap={{ scale: 0.97 }}>
                  <ChevronLeft className="w-4 h-4" /> Retour
                </motion.button>
              )}
              <motion.button
                onClick={() => { if (createStep < 2) { if (!newCmd.produit) { toast.error('Nom du produit obligatoire'); return; } setCreateStep(2); } else creerCommande(); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
                whileTap={{ scale: 0.97 }}>
                {createStep < 2 ? <>Suivant <ChevronRight className="w-4 h-4" /></> : <><Check className="w-4 h-4" /> Créer la commande</>}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── RENDU PRINCIPAL ──────────────────────────────────────────────────────
  return (
    <>
      {/* Header fixe — clone GestionStock */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-bold text-gray-900 text-xl sm:text-2xl">Commandes Groupées</h1>
            <div className="flex items-center gap-2">
              <motion.button onClick={voiceLecture}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                style={{ backgroundColor: C_LIGHT, borderColor: C }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Volume2 className="w-5 h-5" style={{ color: C }} />
              </motion.button>
              <NotificationButton />
              <motion.button onClick={() => setShowFilters(!showFilters)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                style={showFilters ? { backgroundColor: C_LIGHT } : {}}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Filter className="w-5 h-5" style={showFilters ? { color: C } : { color: '#6B7280' }} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu — clone GestionStock */}
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-blue-50 to-white">

        {/* Switch Achats / Ventes — sticky sous header */}
        <div className="mt-4 mb-4">
          <div className="bg-white rounded-2xl p-1.5 border-2 border-gray-100 flex gap-1.5 shadow-sm">
            {([
              { id: 'achats', label: 'Achats Groupés', Icon: ShoppingCart },
              { id: 'ventes', label: 'Ventes Groupées', Icon: TrendingUp },
            ] as const).map(({ id, label, Icon }) => (
              <motion.button key={id}
                onClick={() => { setVue(id); setSearchQuery(''); setFilterCat('Tous'); setFilterStatut('Tous'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${vue === id ? 'text-white shadow-md' : 'text-gray-500'}`}
                style={vue === id ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : {}}
                whileTap={{ scale: 0.97 }}>
                <Icon className={`w-4 h-4 ${vue === id ? 'text-white' : ''}`} />
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* KPIs — même style GestionStock (3 colonnes) */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Actives', val: kpis.actives, Icon: Layers, color: '#2072AF', bg: '#EBF4FB', border: 'border-blue-200' },
            { label: vue === 'achats' ? 'Économies' : 'Revenus', val: vue === 'achats' ? `${(kpis.economies / 1000).toFixed(0)}k` : `${(kpis.revenus / 1000000).toFixed(1)}M`, Icon: vue === 'achats' ? TrendingUp : Banknote, color: '#16A34A', bg: '#F0FDF4', border: 'border-green-200' },
            { label: 'Distribués', val: kpis.distribues, Icon: CheckCircle, color: '#6B7280', bg: '#F9FAFB', border: 'border-gray-200' },
          ].map(({ label, val, Icon, color, bg, border }, i) => (
            <motion.div key={label}
              className={`relative rounded-3xl p-3 shadow-md overflow-hidden border-2 ${border} text-left`}
              style={{ background: `linear-gradient(135deg, ${bg}, white, ${bg})` }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -4 }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600 font-semibold">{label}</p>
                <motion.div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}
                  animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                  <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.5} />
                </motion.div>
              </div>
              <motion.p className="text-2xl font-bold" style={{ color }}
                animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                {val}
              </motion.p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label === 'Économies' ? 'FCFA écon.' : label === 'Revenus' ? 'FCFA générés' : ''}</p>
            </motion.div>
          ))}
        </div>

        {/* Recherche */}
        <motion.div className="mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher une commande groupée..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:outline-none text-sm placeholder:text-gray-400 shadow-sm"
              style={{ borderColor: searchQuery ? C : undefined }} />
            <motion.button onClick={startVoiceSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {isListening
                ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><MicOff className="w-4 h-4" style={{ color: C }} /></motion.div>
                : <Mic className="w-4 h-4 text-gray-400" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">Catégorie</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                      <motion.button key={cat} onClick={() => setFilterCat(cat)}
                        className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold ${filterCat === cat ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                        style={filterCat === cat ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : {}}
                        whileTap={{ scale: 0.95 }}>
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">Statut</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['Tous', ...STATUTS_ORDRE] as const).map(s => {
                      const isActive = filterStatut === s;
                      const scfg = s !== 'Tous' ? STATUT_CFG[s] : null;
                      return (
                        <motion.button key={s} onClick={() => setFilterStatut(s)}
                          className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold"
                          style={isActive && scfg
                            ? { backgroundColor: scfg.bg, borderColor: scfg.color, color: scfg.color }
                            : isActive ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})`, color: 'white', borderColor: 'transparent' }
                            : { borderColor: '#E5E7EB', color: '#6B7280' }}
                          whileTap={{ scale: 0.95 }}>
                          {s === 'Tous' ? 'Tous' : STATUT_CFG[s].label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                <motion.button onClick={() => { setFilterCat('Tous'); setFilterStatut('Tous'); setSearchQuery(''); }}
                  className="w-full py-2 rounded-xl border border-gray-200 text-xs text-gray-500 font-semibold"
                  whileTap={{ scale: 0.97 }}>
                  Réinitialiser les filtres
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Résultat */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-gray-500">
            <span className="font-bold text-gray-900">{filtrees.length}</span> commande{filtrees.length > 1 ? 's' : ''} {vue === 'achats' ? 'achat' : 'vente'}
          </p>
        </div>

        {/* Liste cartes */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtrees.length === 0
              ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <Layers className="w-14 h-14 mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-500 font-semibold">Aucune commande groupée</p>
                  <p className="text-xs text-gray-400 mt-1">Créez votre première commande groupée</p>
                </motion.div>
              )
              : filtrees.map((cmd, i) => renderCarte(cmd, i))
            }
          </AnimatePresence>
        </div>
      </div>

      {/* FAB créer */}
      <motion.button
        onClick={() => { setShowCreer(true); speak(`Créer une nouvelle commande ${vue === 'achats' ? 'achat groupé' : 'vente groupée'}. Appuyez pour commencer.`); }}
        className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 w-16 h-16 rounded-full text-white shadow-2xl flex items-center justify-center z-30"
        style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
        whileHover={{ scale: 1.1, rotate: 90, boxShadow: `0 12px 40px rgba(32,114,175,0.5)` }}
        whileTap={{ scale: 0.9 }}>
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </motion.button>

      {/* Modals */}
      {selected && !showPasserStatut && !showSuspendre && !showParticiper && !showPaiement && !showFournisseur && renderDetailModal()}
      {renderCreerModal()}
      {showPasserStatut && renderPasserStatutModal()}
      {showParticiper && renderParticiperModal()}
      {showFournisseur && renderFournisseurModal()}
      {showPaiement && renderPaiementModal()}
      {showSuspendre && renderSuspendreModal()}

      <Navigation role="cooperative" />
    </>
  );
}
