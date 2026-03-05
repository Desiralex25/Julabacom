import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router';
import { ImagePickerField } from '../shared/ImagePickerField';
import { SelectWithAutre } from '../shared/SelectWithAutre';
import { Montant, MontantCard } from '../shared/Montant';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Mic, MicOff, X, Plus, ChevronRight, ArrowLeft,
  Package, ShoppingCart, Store, Banknote,
  MapPin, Calendar, Send,
  CheckCircle, CheckCircle2, Clock, Truck,
  XCircle, Info, Volume2, Filter,
  RefreshCw, History,
  ArrowDownLeft,
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { useModalRegister } from '../../contexts/ModalContext';
import { NotificationButton } from '../marchand/NotificationButton';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CommandeCard } from '../marche/CommandeCard';
import { HistoriqueList } from '../marche/HistoriqueList';
import {
  PRODUITS_PRODUCTEURS, PRODUITS_COOPERATIVE, COMMANDES_MARCHE,
  ProduitMarche, CommandeMarche as CmdMarche, StatutCommande,
  Q_LABELS, STATUT_CMD_LABELS,
} from '../marche/marketplace-data';

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const C       = '#2072AF';
const C_LIGHT = '#EBF4FB';
const C_DARK  = '#1E5A8E';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabVue        = 'achats' | 'ventes' | 'historique';
type TabAchat      = 'marketplace' | 'mes_achats';
type TabVente      = 'ma_marketplace' | 'commandes_recues';
type TabHistorique = 'h_achats' | 'h_ventes';

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 71 ? '#16A34A' : score >= 41 ? '#EA580C' : '#DC2626';
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={6} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Chip de comptage (lecture seule) ─────────────────────────────────────────
function CountChip({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ backgroundColor: bg, borderColor: `${color}30` }}>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

// ─── Onglet principal ─────────────────────────────────────────────────────────
function OngletBtn({ label, Icon, active, onClick, badge }: {
  label: string; Icon: React.ElementType; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <motion.button onClick={onClick}
      className="relative flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all"
      style={active ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : { backgroundColor: 'white' }}
      whileTap={{ scale: 0.97 }}>
      <Icon className="w-5 h-5" style={{ color: active ? 'white' : '#9CA3AF' }} />
      <span className="text-[11px] font-bold" style={{ color: active ? 'white' : '#6B7280' }}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}

// ─── Sous-onglet ──────────────────────────────────────────────────────────────
function SousOnglet({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'text-white shadow-sm' : 'text-gray-500 bg-transparent'}`}
      style={active ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : {}}>
      {label}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

// ─── Carte Produit style Marchand (grille 2 colonnes avec image) ──────────────
function ProduitCardGrid({ produit, index, onAction, actionLabel, onSecondary, secondaryLabel }: {
  produit: ProduitMarche;
  index: number;
  onAction: (p: ProduitMarche) => void;
  actionLabel: string;
  onSecondary?: (p: ProduitMarche) => void;
  secondaryLabel?: string;
}) {
  const ql = Q_LABELS[produit.qualite];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl overflow-hidden shadow-md border-2 border-gray-200 flex flex-col"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: '0 10px 30px rgba(32,114,175,0.15)' }}
    >
      {/* Image */}
      <div className="relative w-full h-36 bg-gray-100 flex-shrink-0">
        {produit.image ? (
          <ImageWithFallback
            src={produit.image}
            alt={produit.produit}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}>
            <span className="text-4xl font-black text-white/40">
              {produit.produit.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {/* Badge qualité */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: ql.bg, color: ql.color }}>
          {ql.label}
        </div>
        {/* Badge vendeur type */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
          produit.vendeurType === 'producteur' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {produit.vendeurType === 'producteur' ? 'Producteur' : 'Coop'}
        </div>
      </div>

      {/* Infos */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-gray-900 leading-tight mb-0.5 truncate">
          {produit.produit}
        </h3>
        <p className="text-[10px] text-gray-500 mb-1 truncate">{produit.vendeurNom}</p>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{produit.village}</span>
        </div>
        <p className="text-xl font-bold mb-1" style={{ color: C }}>
          <Montant value={produit.prixUnitaire} unit={produit.unite} size="lg" color={C} />
        </p>
        <p className="text-[10px] text-gray-400 mb-3">
          {produit.quantite.toLocaleString()} {produit.unite} dispo.
        </p>
        <motion.button
          onClick={(e) => { e.stopPropagation(); onAction(produit); }}
          className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
          whileTap={{ scale: 0.95 }}>
          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          {actionLabel}
        </motion.button>
        {onSecondary && secondaryLabel && (
          <motion.button
            onClick={(e) => { e.stopPropagation(); onSecondary(produit); }}
            className="w-full mt-1.5 py-2 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-1.5"
            style={{ borderColor: C, color: C, backgroundColor: C_LIGHT }}
            whileTap={{ scale: 0.95 }}>
            <Store className="w-3 h-3" />
            {secondaryLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Carte produit coop "Ma Marketplace" (grille 2 colonnes avec image) ───────
function ProduitCoopCardGrid({ produit, index, onRetirer }: {
  produit: ProduitMarche; index: number; onRetirer: (id: string) => void;
}) {
  const marge = produit.prixOrigine ? produit.prixUnitaire - produit.prixOrigine : null;
  const margePct = (marge && produit.prixOrigine) ? Math.round((marge / produit.prixOrigine) * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl overflow-hidden shadow-md border-2 border-blue-100 flex flex-col"
      whileHover={{ scale: 1.02, y: -4 }}
    >
      {/* Image */}
      <div className="relative w-full h-36 bg-gray-100 flex-shrink-0">
        {produit.image ? (
          <ImageWithFallback
            src={produit.image}
            alt={produit.produit}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}>
            <span className="text-4xl font-black text-white/40">
              {produit.produit.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {margePct !== null && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
            +{margePct}%
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
          Publié
        </div>
      </div>

      {/* Infos */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-gray-900 leading-tight mb-0.5 truncate">
          {produit.produit}
        </h3>
        {produit.vendeurOrigineNom && (
          <p className="text-[10px] text-gray-400 mb-1 truncate">
            Source : {produit.vendeurOrigineNom}
          </p>
        )}
        <p className="text-xl font-bold mb-0.5" style={{ color: C }}>
          <Montant value={produit.prixUnitaire} unit={produit.unite} size="lg" color={C} />
        </p>
        {produit.prixOrigine && (
          <p className="text-[10px] text-gray-400 mb-2">
            Achat : {produit.prixOrigine.toLocaleString()} FCFA/{produit.unite}
          </p>
        )}
        <p className="text-[10px] text-gray-400 mb-3">
          {produit.quantite.toLocaleString()} {produit.unite} en stock
        </p>
        <motion.button
          onClick={(e) => { e.stopPropagation(); onRetirer(produit.id); }}
          className="w-full py-2 rounded-xl border-2 border-red-200 text-red-500 text-xs font-bold flex items-center justify-center gap-1.5"
          whileTap={{ scale: 0.95 }}>
          <X className="w-3 h-3" />
          Retirer
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Carte commande reçue d'un marchand ───────────────────────────────────────
function CommandeRecueCard({ commande, index, onAccepter, onRefuser, onDetails }: {
  commande: CmdMarche; index: number;
  onAccepter: () => void; onRefuser: () => void; onDetails: () => void;
}) {
  const sc = STATUT_CMD_LABELS[commande.statut];
  const isPending = commande.statut === 'en_attente';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm"
      style={{ border: `2px solid ${sc.border}` }}
    >
      {/* Bandeau statut */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: sc.bg }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.color }} />
        <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.label}</span>
        {isPending && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
            Action requise
          </motion.span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-100">
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base truncate">{commande.produit}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {commande.acheteurNom}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-bold text-gray-900">
                {commande.quantite.toLocaleString()} {commande.unite}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-sm font-bold" style={{ color: C }}>
                {commande.montantTotal.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Livraison : {new Date(commande.dateLivraison).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <motion.button onClick={onDetails}
            className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-xs font-bold text-gray-600 flex items-center justify-center gap-1"
            whileTap={{ scale: 0.97 }}>
            <Info className="w-3.5 h-3.5" />
            Détails
          </motion.button>
          {isPending ? (
            <>
              <motion.button onClick={onRefuser}
                className="flex-1 py-2.5 rounded-2xl border-2 border-red-200 text-red-600 text-xs font-bold flex items-center justify-center gap-1"
                whileTap={{ scale: 0.97 }}>
                <XCircle className="w-3.5 h-3.5" />
                Refuser
              </motion.button>
              <motion.button onClick={onAccepter}
                className="flex-[1.5] py-2.5 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-1"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803d)' }}
                whileTap={{ scale: 0.97 }}>
                <CheckCircle className="w-3.5 h-3.5" />
                Accepter
              </motion.button>
            </>
          ) : (
            <div className="flex-[2] py-2.5 rounded-2xl text-center text-xs font-bold"
              style={{ backgroundColor: sc.bg, color: sc.color }}>
              {sc.label}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function MarcheHub() {
  const { speak } = useApp();
  const location = useLocation();

  // ── Vue principale - Initialisée depuis location.state si présent
  const initialVue = (location.state as any)?.vue === 'ventes' ? 'ventes' : 'achats';
  const [vue, setVue] = useState<TabVue>(initialVue);

  // ── Sous-tabs
  const [tabAchat,      setTabAchat]      = useState<TabAchat>('marketplace');
  const [tabVente,      setTabVente]      = useState<TabVente>('ma_marketplace');
  const [tabHistorique, setTabHistorique] = useState<TabHistorique>('h_achats');

  // ── Données partagées
  const [produitsMarche,    setProduitsMarche]    = useState<ProduitMarche[]>(PRODUITS_PRODUCTEURS);
  const [produitsCoopLive,  setProduitsCoopLive]  = useState<ProduitMarche[]>(PRODUITS_COOPERATIVE);
  const [commandesMarche,   setCommandesMarche]   = useState<CmdMarche[]>(COMMANDES_MARCHE);

  // ── Recherche / filtre
  const [searchQuery,     setSearchQuery]     = useState('');
  const [isListening,     setIsListening]     = useState(false);
  const [showFilters,     setShowFilters]     = useState(false);
  const [filterCategorie, setFilterCategorie] = useState('');

  // ── Modals
  const [showPublierModal,  setShowPublierModal]  = useState(false);
  const [produitAPublier,   setProduitAPublier]   = useState<ProduitMarche | null>(null);
  const [selectedCmdMarche, setSelectedCmdMarche] = useState<CmdMarche | null>(null);
  const [showNegocierModal, setShowNegocierModal] = useState(false);
  const [cmdNegocier,       setCmdNegocier]       = useState<CmdMarche | null>(null);
  const [showNouvelleAnnonce, setShowNouvelleAnnonce] = useState(false);

  // ── Sync modal via ModalContext
  useModalRegister(showPublierModal || !!selectedCmdMarche || showNegocierModal || showNouvelleAnnonce);

  // ── KPIs
  const commandesVersProducteurs = useMemo(() =>
    commandesMarche.filter(c => c.acheteurType === 'cooperative'), [commandesMarche]);

  const commandesDesMarchands = useMemo(() =>
    commandesMarche.filter(c => c.vendeurType === 'cooperative'), [commandesMarche]);

  const commandesEnAttente = useMemo(() =>
    commandesDesMarchands.filter(c => c.statut === 'en_attente').length, [commandesDesMarchands]);

  // ── Voix
  const startVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak("La reconnaissance vocale n'est pas disponible"); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR(); rec.lang = 'fr-FR'; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => { setSearchQuery(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend   = () => setIsListening(false);
    rec.start();
  }, [speak]);

  const voiceLecture = () => {
    const msg = `Marché. ${produitsMarche.length} produits producteurs disponibles. Votre marketplace a ${produitsCoopLive.length} produits publiés. ${commandesEnAttente} commande${commandesEnAttente > 1 ? 's' : ''} en attente de votre réponse.`;
    speak(msg); toast.info('Tantie Sagesse parle...');
  };

  // ── Actions
  const handleCommander = (produit: ProduitMarche) => {
    const newCmd: CmdMarche = {
      id: `cm${Date.now()}`,
      acheteurType: 'cooperative',
      acheteurNom: 'Coop Agricole du Bélier',
      vendeurType: 'producteur',
      vendeurId: produit.vendeurId,
      vendeurNom: produit.vendeurNom,
      produit: produit.produit,
      quantite: 100,
      unite: produit.unite,
      prixUnitaire: produit.prixUnitaire,
      montantTotal: 100 * produit.prixUnitaire,
      statut: 'en_attente',
      dateCreation: new Date().toISOString().split('T')[0],
      dateLivraison: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    };
    setCommandesMarche(prev => [newCmd, ...prev]);
    toast.success(`Commande envoyée à ${produit.vendeurNom}`);
    speak(`Commande de ${produit.produit} envoyée. Le producteur recevra une notification.`);
    setTabAchat('mes_achats');
  };

  const handlePublierSurCoop = (produit: ProduitMarche) => {
    setProduitAPublier(produit);
    setShowPublierModal(true);
  };

  const handleRetirerProduit = (id: string) => {
    setProduitsCoopLive(prev => prev.filter(p => p.id !== id));
    toast.success('Produit retiré de votre marketplace');
    speak('Le produit a été retiré de votre marketplace.');
  };

  const handleAccepterCmd = (id: string) => {
    setCommandesMarche(prev => prev.map(c => c.id === id ? { ...c, statut: 'acceptee' as StatutCommande } : c));
    toast.success('Commande acceptée');
    speak('La commande du marchand a été acceptée.');
  };

  const handleRefuserCmd = (id: string) => {
    setCommandesMarche(prev => prev.map(c => c.id === id ? { ...c, statut: 'refusee' as StatutCommande } : c));
    toast.error('Commande refusée');
  };

  // ── Filtres
  const produitsFiltrés = useMemo(() => {
    let list = produitsMarche;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.produit.toLowerCase().includes(q) || p.vendeurNom.toLowerCase().includes(q) || p.categorie.toLowerCase().includes(q));
    }
    if (filterCategorie) list = list.filter(p => p.categorie === filterCategorie);
    return list;
  }, [produitsMarche, searchQuery, filterCategorie]);

  const commandesCoopFiltrées = useMemo(() => {
    let list = commandesVersProducteurs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.produit.toLowerCase().includes(q) || c.vendeurNom.toLowerCase().includes(q));
    }
    return list;
  }, [commandesVersProducteurs, searchQuery]);

  const produitsCoopFiltrés = useMemo(() => {
    if (!searchQuery) return produitsCoopLive;
    const q = searchQuery.toLowerCase();
    return produitsCoopLive.filter(p => p.produit.toLowerCase().includes(q) || p.categorie.toLowerCase().includes(q));
  }, [produitsCoopLive, searchQuery]);

  const commandesMarchandsFiltrées = useMemo(() => {
    let list = commandesDesMarchands;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.produit.toLowerCase().includes(q) || c.acheteurNom.toLowerCase().includes(q));
    }
    return list;
  }, [commandesDesMarchands, searchQuery]);

  const categories = useMemo(() => [...new Set(produitsMarche.map(p => p.categorie))], [produitsMarche]);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══ HEADER FIXE ══ */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 bg-[#F5F0ED]"
        initial={{ y: -100 }} animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl">Marché</h1>
            <NotificationButton />
          </div>

        </div>
      </motion.div>

      {/* ══ CONTENU SCROLLABLE ══ */}
      <div className="pt-28 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#F5F0ED] to-white">

        {/* ── 3 Onglets principaux ── */}
        <div className="bg-white rounded-2xl p-1.5 border-2 border-gray-100 flex gap-1.5 shadow-sm mb-4">
          <OngletBtn
            label="J'achète"
            Icon={ShoppingCart}
            active={vue === 'achats'}
            onClick={() => { setVue('achats'); setSearchQuery(''); }}
          />
          <OngletBtn
            label="Je vends"
            Icon={Store}
            active={vue === 'ventes'}
            onClick={() => { setVue('ventes'); setSearchQuery(''); }}
            badge={commandesEnAttente}
          />
          <OngletBtn
            label="Historique"
            Icon={History}
            active={vue === 'historique'}
            onClick={() => { setVue('historique'); setSearchQuery(''); }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════
              VUE "J'ACHÈTE"
          ══════════════════════════════════════ */}
          {vue === 'achats' && (
            <motion.div key="achats"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}>

              {/* Sous-onglets */}
              <div className="bg-white rounded-2xl p-1.5 border border-gray-100 flex gap-1.5 shadow-sm mb-4">
                <SousOnglet
                  label="Produits disponibles"
                  active={tabAchat === 'marketplace'}
                  onClick={() => setTabAchat('marketplace')}
                  count={produitsMarche.length}
                />
                <SousOnglet
                  label="Mes commandes"
                  active={tabAchat === 'mes_achats'}
                  onClick={() => setTabAchat('mes_achats')}
                  count={commandesVersProducteurs.length}
                />
              </div>

              {/* Barre de recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text"
                  placeholder={tabAchat === 'marketplace' ? 'Chercher un produit ou producteur...' : 'Chercher une commande...'}
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-20 py-3 rounded-2xl bg-white border-2 border-gray-200 focus:outline-none text-sm placeholder:text-gray-400 shadow-sm"
                  style={{ borderColor: searchQuery ? C : undefined }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <motion.button onClick={startVoiceSearch}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isListening ? C_LIGHT : undefined }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    {isListening
                      ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                          <MicOff className="w-4 h-4" style={{ color: C }} />
                        </motion.div>
                      : <Mic className="w-4 h-4 text-gray-400" />}
                  </motion.button>
                  {tabAchat === 'marketplace' && (
                    <motion.button onClick={() => setShowFilters(!showFilters)}
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                      style={showFilters ? { backgroundColor: C, borderColor: C } : { borderColor: '#E5E7EB', backgroundColor: 'white' }}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Filter className="w-3.5 h-3.5" style={{ color: showFilters ? 'white' : '#9CA3AF' }} />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Panel filtres */}
              <AnimatePresence>
                {showFilters && tabAchat === 'marketplace' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4">
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-sm">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Catégorie</label>
                      <select value={filterCategorie} onChange={e => setFilterCategorie(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-xs focus:outline-none bg-white"
                        style={{ borderColor: filterCategorie ? C : undefined }}>
                        <option value="">Toutes les catégories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {filterCategorie && (
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilterCategorie('')}
                          className="mt-2 text-xs font-bold px-3 py-1.5 rounded-xl"
                          style={{ color: C, backgroundColor: C_LIGHT }}>
                          Effacer le filtre
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Contenu sous-tab */}
              <AnimatePresence mode="wait">
                {tabAchat === 'marketplace' && (
                  <motion.div key="mp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4" style={{ color: C }} />
                      <span className="text-sm font-bold text-gray-900">Produits des producteurs</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: C_LIGHT, color: C }}>
                        {produitsFiltrés.length}
                      </span>
                    </div>
                    {produitsFiltrés.length === 0
                      ? <EmptyState icon={<Package className="w-10 h-10" style={{ color: C }} />} message="Aucun produit trouvé" />
                      : (
                        <div className="grid grid-cols-2 gap-3">
                          {produitsFiltrés.map((p, i) => (
                            <ProduitCardGrid
                              key={p.id}
                              produit={p}
                              index={i}
                              onAction={handleCommander}
                              actionLabel="Commander"
                              onSecondary={handlePublierSurCoop}
                              secondaryLabel="Publier"
                            />
                          ))}
                        </div>
                      )
                    }
                  </motion.div>
                )}

                {tabAchat === 'mes_achats' && (
                  <motion.div key="ma" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-bold text-gray-900">Mes commandes aux producteurs</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                        {commandesCoopFiltrées.length}
                      </span>
                    </div>
                    {commandesCoopFiltrées.length === 0
                      ? <EmptyState icon={<ShoppingCart className="w-10 h-10 text-violet-300" />} message="Aucune commande en cours" />
                      : commandesCoopFiltrées.map((c, i) => (
                        <CommandeCard
                          key={c.id}
                          commande={c}
                          profil="cooperative"
                          index={i}
                          onNegocier={(cmd) => { setCmdNegocier(cmd); setShowNegocierModal(true); }}
                          onDetails={(cmd) => setSelectedCmdMarche(cmd)}
                        />
                      ))
                    }
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              VUE "JE VENDS"
          ══════════════════════════════════════ */}
          {vue === 'ventes' && (
            <motion.div key="ventes"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}>

              {/* Sous-onglets */}
              <div className="bg-white rounded-2xl p-1.5 border border-gray-100 flex gap-1.5 shadow-sm mb-4">
                <SousOnglet
                  label="Ma marketplace"
                  active={tabVente === 'ma_marketplace'}
                  onClick={() => setTabVente('ma_marketplace')}
                  count={produitsCoopLive.length}
                />
                <SousOnglet
                  label="Commandes reçues"
                  active={tabVente === 'commandes_recues'}
                  onClick={() => setTabVente('commandes_recues')}
                  count={commandesDesMarchands.length}
                />
              </div>

              {/* Barre de recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text"
                  placeholder={tabVente === 'ma_marketplace' ? 'Chercher un produit publié...' : 'Chercher une commande reçue...'}
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-2xl bg-white border-2 border-gray-200 focus:outline-none text-sm placeholder:text-gray-400 shadow-sm"
                  style={{ borderColor: searchQuery ? C : undefined }}
                />
                <motion.button onClick={startVoiceSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: isListening ? C_LIGHT : undefined }}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  {isListening
                    ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                        <MicOff className="w-4 h-4" style={{ color: C }} />
                      </motion.div>
                    : <Mic className="w-4 h-4 text-gray-400" />}
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {/* ── Ma Marketplace ── */}
                {tabVente === 'ma_marketplace' && (
                  <motion.div key="mm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-3">

                    {/* En-tête + bouton publier */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" style={{ color: C }} />
                        <span className="text-sm font-bold text-gray-900">Mes produits publiés</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: C_LIGHT, color: C }}>
                          {produitsCoopFiltrés.length}
                        </span>
                      </div>
                      <motion.button
                        onClick={() => setShowNouvelleAnnonce(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-white text-xs font-bold shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
                        whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                        <Plus className="w-3.5 h-3.5" />
                        Publier
                      </motion.button>
                    </div>

                    {/* Info pour l'utilisateur */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 rounded-2xl border border-blue-100 p-3 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Ces produits sont visibles par tous les marchands sur la marketplace Jùlaba.
                      </p>
                    </motion.div>

                    {produitsCoopFiltrés.length === 0
                      ? (
                        <EmptyState
                          icon={<Store className="w-10 h-10" style={{ color: C }} />}
                          message="Votre marketplace est vide"
                          sub='Publiez un produit avec le bouton "Publier" ou depuis un produit producteur'
                        />
                      )
                      : (
                        <div className="grid grid-cols-2 gap-3">
                          {produitsCoopFiltrés.map((p, i) => (
                            <ProduitCoopCardGrid
                              key={p.id}
                              produit={p}
                              index={i}
                              onRetirer={handleRetirerProduit}
                            />
                          ))}
                        </div>
                      )
                    }
                  </motion.div>
                )}

                {/* ── Commandes reçues des marchands ── */}
                {tabVente === 'commandes_recues' && (
                  <motion.div key="cr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-3">

                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-gray-900">Commandes des marchands</span>
                      {commandesEnAttente > 0 && (
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">
                          {commandesEnAttente} en attente
                        </motion.span>
                      )}
                    </div>

                    {commandesMarchandsFiltrées.length === 0
                      ? <EmptyState icon={<ShoppingCart className="w-10 h-10 text-green-300" />} message="Aucune commande reçue" />
                      : commandesMarchandsFiltrées.map((c, i) => (
                        <CommandeRecueCard
                          key={c.id}
                          commande={c}
                          index={i}
                          onAccepter={() => handleAccepterCmd(c.id)}
                          onRefuser={() => handleRefuserCmd(c.id)}
                          onDetails={() => setSelectedCmdMarche(c)}
                        />
                      ))
                    }
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              VUE "HISTORIQUE"
          ══════════════════════════════════════ */}
          {vue === 'historique' && (
            <motion.div key="historique"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}>

              {/* Sous-onglets */}
              <div className="bg-white rounded-2xl p-1.5 border border-gray-100 flex gap-1.5 shadow-sm mb-4">
                <SousOnglet
                  label="Mes achats"
                  active={tabHistorique === 'h_achats'}
                  onClick={() => setTabHistorique('h_achats')}
                  count={commandesVersProducteurs.length}
                />
                <SousOnglet
                  label="Mes ventes"
                  active={tabHistorique === 'h_ventes'}
                  onClick={() => setTabHistorique('h_ventes')}
                  count={commandesDesMarchands.length}
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4" style={{ color: C }} />
                <span className="text-sm font-bold text-gray-900">
                  {tabHistorique === 'h_achats' ? 'Historique de mes achats producteurs' : 'Historique de mes ventes aux marchands'}
                </span>
              </div>

              <HistoriqueList
                commandes={commandesMarche}
                profil="cooperative"
                sens={tabHistorique === 'h_achats' ? 'achat' : 'vente'}
                emptyLabel={tabHistorique === 'h_achats' ? "Aucun achat dans l'historique" : "Aucune vente dans l'historique"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════ MODAL Publier sur Coop ════ */}
      <AnimatePresence>{showPublierModal && produitAPublier && (
        <ModalPublierSurCoop
          produit={produitAPublier}
          onClose={() => { setShowPublierModal(false); setProduitAPublier(null); }}
          onPublier={(prixCoop) => {
            const nouveau: ProduitMarche = {
              ...produitAPublier,
              id: `pc${Date.now()}`,
              prixOrigine: produitAPublier.prixUnitaire,
              prixUnitaire: prixCoop,
              vendeurOrigineNom: produitAPublier.vendeurNom,
              vendeurType: 'cooperative',
              vendeurNom: 'Coop Agricole du Bélier',
              vendeurId: 'COOP-001',
              village: 'Yamoussoukro',
              region: 'Bélier',
              telephone: '+225 27 30 20 30',
              scoreVendeur: 91,
              datePublication: new Date().toISOString().split('T')[0],
            };
            setProduitsCoopLive(prev => [nouveau, ...prev]);
            toast.success(`${produitAPublier.produit} publié sur votre marketplace`);
            speak(`${produitAPublier.produit} est maintenant visible par tous les marchands.`);
            setShowPublierModal(false);
            setProduitAPublier(null);
            // Aller directement voir le produit publié
            setVue('ventes');
            setTabVente('ma_marketplace');
          }}
        />
      )}</AnimatePresence>

      {/* ════ MODAL Nouvelle annonce indépendante ════ */}
      <AnimatePresence>{showNouvelleAnnonce && (
        <ModalNouvelleAnnonce
          onClose={() => setShowNouvelleAnnonce(false)}
          onPublier={(produit) => {
            setProduitsCoopLive(prev => [produit, ...prev]);
            toast.success(`${produit.produit} publié sur votre marketplace`);
            speak(`${produit.produit} est maintenant visible par tous les marchands.`);
            setShowNouvelleAnnonce(false);
          }}
        />
      )}</AnimatePresence>

      {/* ════ DRAWER Détail commande ════ */}
      <AnimatePresence>{selectedCmdMarche && (
        <DrawerDetailCmdMarche
          commande={selectedCmdMarche}
          onClose={() => setSelectedCmdMarche(null)}
          onAccepter={() => {
            setCommandesMarche(prev => prev.map(c => c.id === selectedCmdMarche.id
              ? { ...c, statut: 'acceptee' as StatutCommande } : c));
            toast.success('Commande acceptée');
            speak('La commande a été acceptée.');
            setSelectedCmdMarche(null);
          }}
          onRefuser={() => {
            setCommandesMarche(prev => prev.map(c => c.id === selectedCmdMarche.id
              ? { ...c, statut: 'refusee' as StatutCommande } : c));
            toast.error('Commande refusée');
            setSelectedCmdMarche(null);
          }}
        />
      )}</AnimatePresence>

      {/* ════ MODAL Négocier ════ */}
      <AnimatePresence>{showNegocierModal && cmdNegocier && (
        <ModalNegocier
          commande={cmdNegocier}
          onClose={() => { setShowNegocierModal(false); setCmdNegocier(null); }}
          onEnvoyer={(message, prix) => {
            setCommandesMarche(prev => prev.map(c => c.id === cmdNegocier.id
              ? { ...c, statut: 'en_negociation' as StatutCommande, messageNegociation: message, prixNegocie: prix }
              : c));
            toast.success('Proposition de négociation envoyée');
            speak('Votre proposition a été envoyée au producteur.');
            setShowNegocierModal(false); setCmdNegocier(null);
          }}
        />
      )}</AnimatePresence>

      <Navigation role="cooperative" />
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 bg-blue-50">
        {icon}
      </div>
      <p className="font-bold text-gray-400">{message}</p>
      {sub && <p className="text-xs text-gray-300 mt-1 max-w-xs">{sub}</p>}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════
// MODAL PUBLIER SUR COOP (depuis un produit producteur)
// ════════════════════════════════════════════════════════
const C_OP    = '#2072AF';
const C_LIGHT_OP = '#EBF4FB';

function ModalPublierSurCoop({ produit, onClose, onPublier }: {
  produit: ProduitMarche;
  onClose: () => void;
  onPublier: (prixCoop: number) => void;
}) {
  const [prixCoop, setPrixCoop] = useState(String(Math.round(produit.prixUnitaire * 1.15)));
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const marge = parseInt(prixCoop || '0') - produit.prixUnitaire;
  const margePct = produit.prixUnitaire > 0 ? Math.round((marge / produit.prixUnitaire) * 100) : 0;

  const handlePublier = () => {
    if (!prixCoop || parseInt(prixCoop) < produit.prixUnitaire) {
      toast.error('Le prix doit être supérieur au prix producteur'); return;
    }
    setSubmitting(true);
    setTimeout(() => { onPublier(parseInt(prixCoop)); }, 600);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-gray-300" /></div>

        <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Publier sur ma marketplace</h2>
            <p className="text-xs text-gray-500">{produit.produit} — {produit.vendeurNom}</p>
          </div>
          <motion.button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileHover={{ rotate: 90 }}>
            <X className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>

        {/* Barre de progression */}
        <div className="px-5 pt-3">
          <div className="flex gap-1.5">
            {['Prix de vente', 'Confirmation'].map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: C_OP }}
                  animate={{ width: i + 1 <= step ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 && (
            <>
              {/* Prix producteur */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
                <h3 className="font-bold text-gray-900">{produit.produit}</h3>
                <p className="text-xs text-gray-500">{produit.vendeurNom} — {produit.village}</p>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">
                    Prix producteur : {produit.prixUnitaire.toLocaleString()} FCFA/{produit.unite}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Stock : {produit.quantite.toLocaleString()} {produit.unite}</span>
                </div>
              </div>

              {/* Votre prix */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  Votre prix de vente (FCFA / {produit.unite}) <span className="text-red-500">*</span>
                </label>
                <input type="number" value={prixCoop} onChange={e => setPrixCoop(e.target.value)}
                  placeholder={`Ex : ${Math.round(produit.prixUnitaire * 1.15)}`}
                  className="w-full px-4 h-12 rounded-2xl border-2 border-gray-200 text-sm focus:outline-none bg-white"
                  onFocus={e => (e.target.style.borderColor = C_OP)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              </div>

              {/* Calcul marge */}
              {prixCoop && parseInt(prixCoop) > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl p-4 border-2 space-y-2"
                  style={{ backgroundColor: marge >= 0 ? '#F0FDF4' : '#FEF2F2', borderColor: marge >= 0 ? '#86EFAC' : '#FECACA' }}>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Prix producteur</span>
                    <span className="text-xs font-bold text-gray-700">{produit.prixUnitaire.toLocaleString()} FCFA/{produit.unite}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Votre prix</span>
                    <span className="text-xs font-bold" style={{ color: C_OP }}>{parseInt(prixCoop || '0').toLocaleString()} FCFA/{produit.unite}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-xs font-bold text-gray-600">Marge</span>
                    <span className={`text-xs font-bold ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marge >= 0 ? '+' : ''}{marge.toLocaleString()} FCFA ({margePct}%)
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Ce produit sera visible par tous les marchands sur votre marketplace.</p>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Vérifiez avant de publier :</p>
              <div className="rounded-3xl border-2 overflow-hidden" style={{ borderColor: C_OP }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: C_OP }}>
                  <Store className="w-5 h-5 text-white" />
                  <p className="font-bold text-white text-sm">Aperçu de la publication</p>
                </div>
                <div className="p-4 space-y-2.5 bg-white">
                  {[
                    { label: 'Produit',        value: produit.produit },
                    { label: 'Fournisseur',     value: produit.vendeurNom },
                    { label: 'Stock',           value: `${produit.quantite.toLocaleString()} ${produit.unite}` },
                    { label: 'Prix producteur', value: `${produit.prixUnitaire.toLocaleString()} FCFA/${produit.unite}` },
                    { label: 'Votre prix',      value: `${parseInt(prixCoop).toLocaleString()} FCFA/${produit.unite}` },
                    { label: 'Marge',           value: `+${marge.toLocaleString()} FCFA (${margePct}%)` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-bold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <motion.div className="rounded-2xl p-3 flex items-start gap-2 bg-green-50 border border-green-100"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 font-semibold">
                  Après publication, les marchands verront ce produit immédiatement.
                </p>
              </motion.div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
          {step > 1 && (
            <motion.button onClick={() => setStep(s => s - 1)} whileTap={{ scale: 0.97 }}
              className="py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-700 flex items-center justify-center gap-2 whitespace-nowrap">
              <ArrowLeft className="w-4 h-4 flex-shrink-0" /> Retour
            </motion.button>
          )}
          {step < 2 ? (
            <motion.button
              onClick={() => {
                if (!prixCoop || parseInt(prixCoop) <= 0) { toast.error('Saisissez un prix valide'); return; }
                if (parseInt(prixCoop) < produit.prixUnitaire) { toast.error('Le prix doit dépasser le prix producteur'); return; }
                setStep(2);
              }}
              whileTap={{ scale: 0.97 }}
              className="py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${C_OP}, ${C_DARK})`, gridColumn: '1 / -1' }}>
              Suivant <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button onClick={handlePublier} disabled={submitting} whileTap={{ scale: 0.97 }}
              className="py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803d)' }}>
              {submitting
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><RefreshCw className="w-4 h-4" /></motion.div>
                : <Store className="w-4 h-4" />}
              {submitting ? 'Publication...' : 'Publier maintenant'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════
// MODAL NOUVELLE ANNONCE INDÉPENDANTE
// ════════════════════════════════════════════════════════
function ModalNouvelleAnnonce({ onClose, onPublier }: {
  onClose: () => void;
  onPublier: (produit: ProduitMarche) => void;
}) {
  const [produit,   setProduit]   = useState('');
  const [categorie, setCategorie] = useState('');
  const [quantite,  setQuantite]  = useState('');
  const [unite,     setUnite]     = useState('kg');
  const [prix,      setPrix]      = useState('');
  const [qualite,   setQualite]   = useState<'A'|'B'|'C'>('A');
  const [image,     setImage]     = useState('');

  const doPublier = () => {
    if (!produit || !quantite || !prix) { toast.error('Remplis tous les champs obligatoires'); return; }
    const nouveau: ProduitMarche = {
      id: `pc${Date.now()}`,
      produit, categorie: categorie || 'Autres',
      quantite: parseInt(quantite),
      unite, prixUnitaire: parseInt(prix), qualite,
      vendeurType: 'cooperative', vendeurNom: 'Coop Agricole du Bélier', vendeurId: 'COOP-001',
      village: 'Yamoussoukro', region: 'Bélier', telephone: '+225 27 30 20 30',
      scoreVendeur: 91, datePublication: new Date().toISOString().split('T')[0],
      image: image || undefined,
    };
    onPublier(nouveau);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-gray-300" /></div>

        <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Nouvelle annonce</h2>
            <p className="text-xs text-gray-500">Publier un produit sur votre marketplace</p>
          </div>
          <motion.button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileHover={{ rotate: 90 }}>
            <X className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Photo du produit */}
          <ImagePickerField
            label="Photo du produit (facultatif)"
            value={image}
            onChange={setImage}
            primaryColor={C_OP}
            shape="rect"
            size={88}
          />

          {[
            { label: 'Nom du produit', val: produit, set: setProduit, ph: 'Ex : Riz local, Ignames...', req: true },
            { label: 'Catégorie', val: categorie, set: setCategorie, ph: 'Ex : Céréales, Tubercules...' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                {f.label}{f.req && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <input type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                className="w-full px-4 h-12 rounded-2xl border-2 border-gray-200 text-sm focus:outline-none bg-white"
                onFocus={e => (e.target.style.borderColor = C_OP)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Quantité <span className="text-red-500">*</span></label>
              <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} placeholder="Ex : 500"
                className="w-full px-4 h-12 rounded-2xl border-2 border-gray-200 text-sm focus:outline-none bg-white"
                onFocus={e => (e.target.style.borderColor = C_OP)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
            <SelectWithAutre
              label="Unité"
              value={unite}
              onChange={setUnite}
              options={['kg', 'tonne', 'régimes', 'sac', 'litre', 'carton']}
              primaryColor={C_OP}
              placeholder="Ex: barrique, panier..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Prix de vente (FCFA) <span className="text-red-500">*</span></label>
            <input type="number" value={prix} onChange={e => setPrix(e.target.value)} placeholder="Ex : 750"
              className="w-full px-4 h-12 rounded-2xl border-2 border-gray-200 text-sm focus:outline-none bg-white"
              onFocus={e => (e.target.style.borderColor = C_OP)} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Qualité</label>
            <div className="flex gap-2">
              {(['A', 'B', 'C'] as const).map(q => (
                <motion.button key={q} onClick={() => setQualite(q)} whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all"
                  style={{
                    borderColor: qualite === q ? Q_LABELS[q].color : '#E5E7EB',
                    backgroundColor: qualite === q ? Q_LABELS[q].bg : 'white',
                    color: qualite === q ? Q_LABELS[q].color : '#9CA3AF',
                  }}>
                  {Q_LABELS[q].label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <motion.button onClick={doPublier} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C_OP}, ${C_DARK})` }}>
            <Store className="w-4 h-4" /> Publier sur ma marketplace
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════
// MODAL NÉGOCIER
// ════════════════════════════════════════════════════════
function ModalNegocier({ commande, onClose, onEnvoyer }: {
  commande: CmdMarche;
  onClose: () => void;
  onEnvoyer: (message: string, prix: number) => void;
}) {
  const [prixPropose, setPrixPropose] = useState(String(commande.prixUnitaire));
  const [message, setMessage] = useState('');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-gray-300" /></div>
        <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Proposer une négociation</h2>
            <p className="text-xs text-gray-500">{commande.produit} — {commande.vendeurNom}</p>
          </div>
          <motion.button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" whileHover={{ rotate: 90 }}>
            <X className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-3 flex gap-3">
            <Banknote className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Prix actuel</p>
              <p className="text-sm font-bold text-gray-900">{commande.prixUnitaire.toLocaleString()} FCFA / {commande.unite}</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Votre prix proposé (FCFA / {commande.unite})</label>
            <input type="number" value={prixPropose} onChange={e => setPrixPropose(e.target.value)}
              placeholder={`Ex : ${Math.round(commande.prixUnitaire * 0.9)}`}
              className="w-full px-4 h-12 rounded-2xl border-2 border-gray-200 text-sm focus:outline-none bg-white"
              onFocus={e => (e.target.style.borderColor = '#8B5CF6')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Message au producteur</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
              placeholder="Ex : Pour une commande de 500 kg, nous pouvons accepter ce prix..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:outline-none bg-white resize-none"
              onFocus={e => (e.target.style.borderColor = '#8B5CF6')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <motion.button
            onClick={() => {
              if (!prixPropose || !message.trim()) { toast.error('Saisissez un prix et un message'); return; }
              onEnvoyer(message, parseInt(prixPropose));
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
            <Send className="w-4 h-4" /> Envoyer la proposition
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════
// DRAWER DÉTAIL COMMANDE
// ════════════════════════════════════════════════════════
function DrawerDetailCmdMarche({ commande, onClose, onAccepter, onRefuser }: {
  commande: CmdMarche; onClose: () => void; onAccepter: () => void; onRefuser: () => void;
}) {
  const sc = STATUT_CMD_LABELS[commande.statut];
  const isPending = commande.statut === 'en_attente';

  const etapes: { label: string; done: boolean }[] = [
    { label: 'Commande reçue',   done: true },
    { label: 'Acceptée',         done: ['acceptee', 'livree'].includes(commande.statut) },
    { label: 'En livraison',     done: commande.statut === 'livree' },
    { label: 'Livrée',           done: commande.statut === 'livree' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-t-3xl w-full max-h-[88vh] overflow-hidden flex flex-col">
        <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-gray-300" /></div>

        <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Détail de la commande</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc?.color}18`, color: sc?.color }}>
                {sc?.label}
              </span>
              <span className="text-xs text-gray-400">#{commande.id}</span>
            </div>
          </div>
          <motion.button onClick={onClose} whileHover={{ rotate: 90 }} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Produit + montant */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100 p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Package className="w-7 h-7 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-base truncate">{commande.produit}</p>
              <p className="text-sm text-gray-500">{commande.quantite.toLocaleString()} {commande.unite} × {commande.prixUnitaire.toLocaleString()} FCFA</p>
              <p className="text-base font-black text-blue-700 mt-0.5">{commande.montantTotal.toLocaleString()} FCFA</p>
            </div>
          </div>

          {/* Acheteur / Vendeur */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Acheteur', nom: commande.acheteurNom, type: commande.acheteurType },
              { label: 'Vendeur',  nom: commande.vendeurNom,  type: commande.vendeurType  },
            ].map(p => (
              <div key={p.label} className="bg-gray-50 rounded-2xl border border-gray-100 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{p.label}</p>
                <p className="text-sm font-bold text-gray-800 truncate">{p.nom}</p>
                <p className="text-xs text-gray-500 capitalize">{p.type}</p>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Créée le',         val: commande.dateCreation  },
              { label: 'Livraison prévue', val: commande.dateLivraison },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 rounded-2xl border border-gray-100 p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{d.label}</p>
                <p className="text-sm font-bold text-gray-800">{d.val}</p>
              </div>
            ))}
          </div>

          {/* Message négociation */}
          {commande.messageNegociation && (
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-bold text-purple-600 uppercase">Message de négociation</p>
              </div>
              <p className="text-sm text-gray-700">{commande.messageNegociation}</p>
              {commande.prixNegocie && (
                <p className="text-sm font-bold text-purple-700 mt-1.5">
                  Prix proposé : {commande.prixNegocie.toLocaleString()} FCFA/{commande.unite}
                </p>
              )}
            </div>
          )}

          {/* Suivi étapes */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Suivi de la commande</p>
            <div className="relative pl-8">
              <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-gray-200" />
              <motion.div className="absolute left-3.5 top-4 w-0.5 bg-blue-500 origin-top"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: etapes.filter(e => e.done).length / etapes.length }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%' }} />
              <div className="space-y-4">
                {etapes.map((etape, i) => (
                  <motion.div key={etape.label}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3">
                    <div className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                      etape.done ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
                    }`}>
                      {etape.done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Clock className="w-3 h-3 text-gray-300" />}
                    </div>
                    <p className={`text-sm font-semibold ${etape.done ? 'text-gray-800' : 'text-gray-400'}`}>{etape.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-white flex gap-3">
          {isPending ? (
            <>
              <motion.button onClick={onRefuser} whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 rounded-2xl border-2 border-red-200 text-red-600 text-sm font-bold flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Refuser
              </motion.button>
              <motion.button onClick={onAccepter} whileTap={{ scale: 0.97 }}
                className="flex-[2] py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2072AF, #1E5A8E)' }}>
                <CheckCircle className="w-4 h-4" /> Accepter
              </motion.button>
            </>
          ) : (
            <motion.button onClick={onClose} whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-bold">
              Fermer
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
