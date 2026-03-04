/**
 * CommandesProducteurPage — Menu "Commandes" du Producteur
 * Structure identique pixel-perfect à GestionStock du Marchand
 * Couleur primaire : #2E8B57 (vert producteur)
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  Trash2,
  X,
  ChevronRight,
  Filter,
  Mic,
  MicOff,
  CheckCircle,
  Clock,
  Truck,
  User,
  MapPin,
  Calendar,
  Phone,
  Package,
  Bell,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Banknote,
  Info,
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useCommande } from '../../contexts/CommandeContext';
import { CommandeStatus } from '../../types/julaba.types';
import type { Commande as CtxCommande } from '../../types/julaba.types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { NotificationButton } from '../marchand/NotificationButton';
import imgTomate    from 'figma:asset/3f404bf155a6eee4cc2737b6af97a7c631b87222.png';
import imgAubergine from 'figma:asset/6ce6df54809849e879a06eaf7918a55ca163820f.png';
import imgPiment    from 'figma:asset/d54203781be4a457752de89ea0db6890f85d988e.png';
import imgGombo     from 'figma:asset/95307b3732ef40ca9d8bd6624da7c522d9948462.png';
import imgManioc    from 'figma:asset/a8dd641535ef5323445a866d2e4bd615e27fc174.png';
import imgIgname    from 'figma:asset/3455362570027e36c9a85017824295c213e28df6.png';
import imgMais      from 'figma:asset/e1a0b089a99b00606487505dfc216319053c9041.png';
import imgRiz       from 'figma:asset/56b3634c65cdeb27356c50771cd1f9dcc7896111.png';
import imgBanane    from 'figma:asset/92dc960457fec2eabe1d823033adf5fa3c460d5a.png';
import imgOignon    from 'figma:asset/c3ae45cebe4fdb00d42876b5d0ceefb1dc8f4f6a.png';
import imgAvocat    from 'figma:asset/4d72e34496aa54e4e0690caf465e524ccfaba086.png';
import imgAutre     from 'figma:asset/258632942d5c4b19368d2b4708d1d8028773eb5e.png';

const COLOR = '#2E8B57';

const PRODUITS_ICONS = [
  { id: 'Tomate',          img: imgTomate    },
  { id: 'Aubergine',       img: imgAubergine },
  { id: 'Piment',          img: imgPiment    },
  { id: 'Gombo',           img: imgGombo     },
  { id: 'Manioc',          img: imgManioc    },
  { id: 'Igname',          img: imgIgname    },
  { id: 'Maïs',            img: imgMais      },
  { id: 'Riz',             img: imgRiz       },
  { id: 'Banane plantain', img: imgBanane    },
  { id: 'Oignon',          img: imgOignon    },
  { id: 'Avocat',          img: imgAvocat    },
  { id: 'Autre',           img: imgAutre     },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type StatutType = 'nouvelle' | 'acceptee' | 'preparation' | 'livree' | 'litige' | 'cloturee';

interface Commande {
  id: string;
  produit: string;
  image: string;
  acheteur: string;
  telephone: string;
  localite: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  prixTotal: number;
  statut: StatutType;
  dateCommande: string;
  dateLivraison: string;
  categorie: string;
  /** progression livraison 0–100 */
  progression: number;
  /** prime de qualité en % */
  prime: number;
}

// ── Données statiques ──────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<StatutType, { label: string; color: string; bg: string; border: string; progress: number }> = {
  nouvelle:    { label: 'Nouvelle',       color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d', progress: 10 },
  acceptee:    { label: 'Acceptée',       color: '#3b82f6', bg: '#dbeafe', border: '#93c5fd', progress: 35 },
  preparation: { label: 'En préparation', color: '#a855f7', bg: '#f3e8ff', border: '#d8b4fe', progress: 65 },
  livree:      { label: 'Livrée',         color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', progress: 100 },
  litige:      { label: 'Litige',         color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', progress: 50 },
  cloturee:    { label: 'Clôturée',       color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db', progress: 100 },
};

const categories = [
  { id: 'tous',       label: 'Toutes' },
  { id: 'cereales',   label: 'Céréales' },
  { id: 'legumes',    label: 'Légumes' },
  { id: 'fruits',     label: 'Fruits' },
  { id: 'tubercules', label: 'Tubercules' },
  { id: 'epices',     label: 'Épices' },
];

const statuts = [
  { id: 'tous',       label: 'Tous les statuts' },
  { id: 'nouvelle',   label: 'Nouvelles' },
  { id: 'acceptee',   label: 'Acceptées' },
  { id: 'preparation',label: 'En préparation' },
  { id: 'livree',     label: 'Livrées' },
  { id: 'litige',     label: 'Litiges' },
  { id: 'cloturee',   label: 'Clôturées' },
];

const sortOptions = [
  { id: 'date_desc',    label: 'Plus récentes d\'abord' },
  { id: 'date_asc',     label: 'Plus anciennes d\'abord' },
  { id: 'montant_desc', label: 'Montant (élevé)' },
  { id: 'montant_asc',  label: 'Montant (faible)' },
  { id: 'priorite',     label: 'Priorité (nouvelles)' },
];

const mockCommandes: Commande[] = [
  {
    id: 'CMD-001',
    produit: 'Riz local',
    image: 'https://images.unsplash.com/photo-1763537351442-f377a4878d9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZ3JhaW4lMjBoYXJ2ZXN0JTIwZmFybXxlbnwxfHx8fDE3NzI1NTUzMjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Koffi Marchand',
    telephone: '07 00 11 22',
    localite: 'Abidjan',
    quantite: 150,
    unite: 'kg',
    prixUnitaire: 650,
    prixTotal: 97500,
    statut: 'preparation',
    dateCommande: '2026-02-25',
    dateLivraison: '2026-03-05',
    categorie: 'cereales',
    progression: 65,
    prime: 8,
  },
  {
    id: 'CMD-002',
    produit: 'Plantain',
    image: 'https://images.unsplash.com/photo-1750601455197-a7ba46fb1544?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudGFpbiUyMGJhbmFuYSUyMGJ1bmNoJTIwaGFydmVzdHxlbnwxfHx8fDE3NzI1NTUzMTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Aminata Coop.',
    telephone: '05 44 55 66',
    localite: 'Yamoussoukro',
    quantite: 20,
    unite: 'régimes',
    prixUnitaire: 2500,
    prixTotal: 50000,
    statut: 'nouvelle',
    dateCommande: '2026-03-01',
    dateLivraison: '2026-03-08',
    categorie: 'fruits',
    progression: 10,
    prime: 12,
  },
  {
    id: 'CMD-003',
    produit: 'Tomates',
    image: 'https://images.unsplash.com/photo-1734255026082-82fdc81991f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjB2ZWdldGFibGVzJTIwZnJlc2glMjBtYXJrZXQlMjBhZnJpY2F8ZW58MXx8fHwxNzcyNTU1MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Ibrahim Grossiste',
    telephone: '01 33 44 55',
    localite: 'Bouaké',
    quantite: 80,
    unite: 'kg',
    prixUnitaire: 350,
    prixTotal: 28000,
    statut: 'livree',
    dateCommande: '2026-02-20',
    dateLivraison: '2026-02-28',
    categorie: 'legumes',
    progression: 100,
    prime: 5,
  },
  {
    id: 'CMD-004',
    produit: 'Maïs',
    image: 'https://images.unsplash.com/photo-1649251037465-72c9d378acb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwbWFpemUlMjBmaWVsZCUyMGhhcnZlc3R8ZW58MXx8fHwxNzcyNTU1MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Fatoumata SARL',
    telephone: '07 77 88 99',
    localite: 'San-Pédro',
    quantite: 200,
    unite: 'kg',
    prixUnitaire: 500,
    prixTotal: 100000,
    statut: 'acceptee',
    dateCommande: '2026-02-28',
    dateLivraison: '2026-03-10',
    categorie: 'cereales',
    progression: 35,
    prime: 10,
  },
  {
    id: 'CMD-005',
    produit: 'Gombo',
    image: 'https://images.unsplash.com/photo-1662318183265-5bbe6578d1b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxva3JhJTIwZ29tYm8lMjB2ZWdldGFibGUlMjBncmVlbiUyMGZyZXNofGVufDF8fHx8MTc3MjU1NTMyNnww&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Moussa Restaurant',
    telephone: '05 22 33 44',
    localite: 'Abidjan',
    quantite: 50,
    unite: 'tas',
    prixUnitaire: 200,
    prixTotal: 10000,
    statut: 'litige',
    dateCommande: '2026-02-15',
    dateLivraison: '2026-02-22',
    categorie: 'legumes',
    progression: 50,
    prime: 0,
  },
  {
    id: 'CMD-006',
    produit: 'Mangue',
    image: 'https://images.unsplash.com/photo-1734163075572-8948e799e42c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nbyUyMHRyb3BpY2FsJTIwZnJ1aXQlMjBmcmVzaHxlbnwxfHx8fDE3NzI1NTUzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Yao Export',
    telephone: '01 66 77 88',
    localite: 'Korhogo',
    quantite: 500,
    unite: 'kg',
    prixUnitaire: 300,
    prixTotal: 150000,
    statut: 'cloturee',
    dateCommande: '2026-02-01',
    dateLivraison: '2026-02-10',
    categorie: 'fruits',
    progression: 100,
    prime: 15,
  },
  {
    id: 'CMD-007',
    produit: 'Ananas',
    image: 'https://images.unsplash.com/photo-1765052450765-a0043208e1be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5lYXBwbGUlMjB0cm9waWNhbCUyMGhhcnZlc3QlMjBmYXJtfGVufDF8fHx8MTc3MjU1NTMyNnww&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Diabaté Coop.',
    telephone: '07 11 22 33',
    localite: 'Abengourou',
    quantite: 300,
    unite: 'kg',
    prixUnitaire: 250,
    prixTotal: 75000,
    statut: 'nouvelle',
    dateCommande: '2026-03-02',
    dateLivraison: '2026-03-12',
    categorie: 'fruits',
    progression: 10,
    prime: 7,
  },
  {
    id: 'CMD-008',
    produit: 'Oignons',
    image: 'https://images.unsplash.com/photo-1624295886828-c4b77b618e5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmlvbiUyMGhhcnZlc3QlMjBmYXJtJTIwYnVsYnxlbnwxfHx8fDE3NzI1NTUzMjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Soro Épicerie',
    telephone: '05 55 66 77',
    localite: 'Man',
    quantite: 100,
    unite: 'kg',
    prixUnitaire: 400,
    prixTotal: 40000,
    statut: 'preparation',
    dateCommande: '2026-02-26',
    dateLivraison: '2026-03-04',
    categorie: 'legumes',
    progression: 65,
    prime: 6,
  },
  {
    id: 'CMD-009',
    produit: 'Ignames',
    image: 'figma:asset/7b5929e307a7d1715c5a7dbb4b6c0658a539777f.png',
    acheteur: 'Koné Grossiste',
    telephone: '01 44 55 66',
    localite: 'Daloa',
    quantite: 250,
    unite: 'kg',
    prixUnitaire: 450,
    prixTotal: 112500,
    statut: 'acceptee',
    dateCommande: '2026-02-27',
    dateLivraison: '2026-03-07',
    categorie: 'tubercules',
    progression: 35,
    prime: 9,
  },
  {
    id: 'CMD-010',
    produit: 'Riz local',
    image: 'https://images.unsplash.com/photo-1763537351442-f377a4878d9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZ3JhaW4lMjBoYXJ2ZXN0JTIwZmFybXxlbnwxfHx8fDE3NzI1NTUzMjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    acheteur: 'Touré Import',
    telephone: '07 88 99 00',
    localite: 'Abidjan',
    quantite: 500,
    unite: 'kg',
    prixUnitaire: 650,
    prixTotal: 325000,
    statut: 'livree',
    dateCommande: '2026-02-18',
    dateLivraison: '2026-02-26',
    categorie: 'cereales',
    progression: 100,
    prime: 8,
  },
];

// ── Formulaire nouvelle commande ──────────────────────────────────────────────

const emptyForm = {
  produit: '',
  acheteur: '',
  telephone: '',
  localite: '',
  quantite: 0,
  unite: 'kg',
  prixUnitaire: 0,
  categorie: 'cereales',
  dateLivraison: '',
};

// ── Composant principal ────────────────────────────────────────────────────────

export function ProducteurCommandes() {
  const { user } = useUser();
  const { speak, setIsModalOpen } = useApp();
  const {
    commandes: ctxCommandes,
    accepterCommande,
    refuserCommande,
    contreProposerPrix,
    marquerLivree,
    recupererPaiement,
  } = useCommande();

  const [commandes, setCommandes] = useState<Commande[]>(mockCommandes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('tous');
  const [selectedStatut, setSelectedStatut] = useState('tous');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedCmd, setSelectedCmd] = useState<Commande | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showRevenusModal, setShowRevenusModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgentes' | 'livrees'>('all');
  const [newForm, setNewForm] = useState(emptyForm);

  // ── États pour les demandes reçues (CommandeContext) ──────────────────────
  const [selectedDemande, setSelectedDemande] = useState<CtxCommande | null>(null);
  const [showDemandeDetailModal, setShowDemandeDetailModal] = useState(false);
  const [showContrePropoModal, setShowContrePropoModal] = useState(false);
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [nouveauPrix, setNouveauPrix] = useState(0);
  const [messageContrePropo, setMessageContrePropo] = useState('');
  const [raisonRefus, setRaisonRefus] = useState('');
  const [isSubmittingDemande, setIsSubmittingDemande] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const hasWelcomed = useRef(false);

  useEffect(() => {
    const isAnyOpen = showAddModal || showDetailModal || showFilterModal || showDemandeDetailModal || showContrePropoModal || showRefusModal;
    setIsModalOpen(isAnyOpen);
  }, [showAddModal, showDetailModal, showFilterModal, showDemandeDetailModal, showContrePropoModal, showRefusModal, setIsModalOpen]);

  // ── Demandes reçues depuis CommandeContext (marchands → ce producteur) ─────
  // On affiche toutes les commandes de type producteur pour la démo
  const demandesRecues = ctxCommandes.filter(c =>
    c.sellerRole === 'producteur' && [
      CommandeStatus.EN_ATTENTE,
      CommandeStatus.EN_NEGOCIATION,
      CommandeStatus.ACCEPTEE,
      CommandeStatus.PAYEE,
      CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND,
      CommandeStatus.LIVREE,
    ].includes(c.status)
  );
  const demandesEnAttente = demandesRecues.filter(c =>
    c.status === CommandeStatus.EN_ATTENTE || c.status === CommandeStatus.EN_NEGOCIATION
  );

  // ── Helpers affichage statut contexte ─────────────────────────────────────
  const getCtxStatutLabel = (status: CommandeStatus) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      EN_ATTENTE:                       { label: 'En attente',         color: '#f59e0b', bg: '#fef3c7' },
      EN_NEGOCIATION:                   { label: 'En négociation',     color: '#8b5cf6', bg: '#ede9fe' },
      ACCEPTEE:                         { label: 'Acceptée',           color: '#3b82f6', bg: '#dbeafe' },
      PAYEE:                            { label: 'Payée — Prête',      color: '#10b981', bg: '#d1fae5' },
      EN_ATTENTE_CONFIRMATION_MARCHAND: { label: 'Livraison déclarée', color: '#06b6d4', bg: '#cffafe' },
      LIVREE:                           { label: 'Livrée',             color: '#2E8B57', bg: '#dcfce7' },
      TERMINEE:                         { label: 'Terminée',           color: '#6b7280', bg: '#f3f4f6' },
      REFUSEE:                          { label: 'Refusée',            color: '#ef4444', bg: '#fee2e2' },
      EXPIREE:                          { label: 'Expirée',            color: '#9ca3af', bg: '#f9fafb' },
    };
    return map[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  };

  const formatCountdown = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expirée';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}min restantes`;
  };

  // ── Actions sur demandes ───────────────────────────────────────────────────
  const handleAccepterDemande = async (cmd: CtxCommande) => {
    setIsSubmittingDemande(true);
    try {
      await accepterCommande(cmd.id, cmd.sellerId);
      speak(`Commande de ${cmd.buyerName} acceptée. Le marchand va maintenant payer.`);
      setShowDemandeDetailModal(false);
    } catch (e: any) {
      speak(`Erreur : ${e.message}`);
    }
    setIsSubmittingDemande(false);
  };

  const handleRefuserDemande = async () => {
    if (!selectedDemande || !raisonRefus.trim()) return;
    setIsSubmittingDemande(true);
    try {
      await refuserCommande(selectedDemande.id, selectedDemande.sellerId, raisonRefus);
      speak(`Commande refusée.`);
      setShowRefusModal(false);
      setShowDemandeDetailModal(false);
      setRaisonRefus('');
    } catch (e: any) {
      speak(`Erreur : ${e.message}`);
    }
    setIsSubmittingDemande(false);
  };

  const handleContreProposer = async () => {
    if (!selectedDemande || nouveauPrix <= 0) return;
    setIsSubmittingDemande(true);
    try {
      await contreProposerPrix(selectedDemande.id, selectedDemande.sellerId, nouveauPrix, messageContrePropo);
      speak(`Contre-proposition de ${nouveauPrix.toLocaleString('fr-FR')} FCFA envoyée au marchand.`);
      setShowContrePropoModal(false);
      setShowDemandeDetailModal(false);
      setNouveauPrix(0);
      setMessageContrePropo('');
    } catch (e: any) {
      speak(`Erreur : ${e.message}`);
    }
    setIsSubmittingDemande(false);
  };

  const handleMarquerLivre = async (cmd: CtxCommande) => {
    setIsSubmittingDemande(true);
    try {
      await marquerLivree(cmd.id, cmd.sellerId);
      speak(`Livraison déclarée. Le marchand va confirmer la réception.`);
      setShowDemandeDetailModal(false);
    } catch (e: any) {
      speak(`Erreur : ${e.message}`);
    }
    setIsSubmittingDemande(false);
  };

  const handleRecupererPaiement = async (cmd: CtxCommande) => {
    setIsSubmittingDemande(true);
    try {
      await recupererPaiement(cmd.id, cmd.sellerId);
      speak(`Paiement récupéré ! L'argent est maintenant dans ton wallet.`);
      setShowDemandeDetailModal(false);
    } catch (e: any) {
      speak(`Erreur : ${e.message}`);
    }
    setIsSubmittingDemande(false);
  };

  useEffect(() => {
    if (!hasWelcomed.current && user) {
      hasWelcomed.current = true;
      setTimeout(() => {
        speak(`Bienvenue ${(user as any).prenoms || 'producteur'} ! Voici tes commandes. Dis-moi si tu veux accepter ou préparer une commande.`);
      }, 900);
    }
  }, [user]);

  // ── Conversion CtxCommande → Commande locale (grille standard) ────────────
  const ctxStatusToLocal = (status: CommandeStatus): StatutType => {
    switch (status) {
      case CommandeStatus.ACCEPTEE:                          return 'acceptee';
      case CommandeStatus.PAYEE:                             return 'preparation';
      case CommandeStatus.EN_LIVRAISON:
      case CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND:  return 'preparation';
      case CommandeStatus.LIVREE:
      case CommandeStatus.TERMINEE:                          return 'livree';
      case CommandeStatus.REFUSEE:
      case CommandeStatus.ANNULEE:
      case CommandeStatus.EXPIREE:                           return 'cloturee';
      default:                                               return 'nouvelle';
    }
  };

  const commandesNegoTerminees: Commande[] = ctxCommandes
    .filter(c =>
      c.sellerRole === 'producteur' &&
      c.status !== CommandeStatus.EN_ATTENTE &&
      c.status !== CommandeStatus.EN_NEGOCIATION
    )
    .map(c => {
      const statut = ctxStatusToLocal(c.status);
      return {
        id: c.id,
        produit: c.productName,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
        acheteur: c.buyerName,
        telephone: '',
        localite: '',
        quantite: c.quantity,
        unite: c.uniteProduit,
        prixUnitaire: c.prixFinal ?? c.prixInitial,
        prixTotal: c.montantTotal,
        statut,
        dateCommande: c.createdAt.split('T')[0],
        dateLivraison: '',
        categorie: 'cereales',
        progression: STATUT_CONFIG[statut].progress,
        prime: 0,
      } satisfies Commande;
    });

  const toutesCommandes = [...commandes, ...commandesNegoTerminees];

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const urgentes = toutesCommandes.filter(c => c.statut === 'nouvelle' || c.statut === 'litige');
  const encaissees = toutesCommandes.filter(c => c.statut === 'livree' || c.statut === 'cloturee');
  const totalRevenus = encaissees.reduce((s, c) => s + c.prixTotal, 0);

  // ── Filtrage + tri ─────────────────────────────────────────────────────────
  const filtered = toutesCommandes
    .filter(c => {
      const matchCat = selectedCategorie === 'tous' || c.categorie === selectedCategorie;
      const matchStat = selectedStatut === 'tous' || c.statut === selectedStatut;
      const matchSearch =
        c.produit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.acheteur.toLowerCase().includes(searchQuery.toLowerCase());
      const matchActive =
        activeFilter === 'all' ? true :
        activeFilter === 'urgentes' ? (c.statut === 'nouvelle' || c.statut === 'litige') :
        activeFilter === 'livrees' ? (c.statut === 'livree' || c.statut === 'cloturee') :
        true;
      return matchCat && matchStat && matchSearch && matchActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':   return b.dateCommande.localeCompare(a.dateCommande);
        case 'date_asc':    return a.dateCommande.localeCompare(b.dateCommande);
        case 'montant_desc': return b.prixTotal - a.prixTotal;
        case 'montant_asc':  return a.prixTotal - b.prixTotal;
        case 'priorite':    return (a.statut === 'nouvelle' ? -1 : 1);
        default: return 0;
      }
    });

  // ── Actions ────────────────────────────────────────────────────────────────
  const changerStatut = (id: string, statut: StatutType) => {
    setCommandes(prev => prev.map(c =>
      c.id === id
        ? { ...c, statut, progression: STATUT_CONFIG[statut].progress }
        : c
    ));
    setShowDetailModal(false);
    speak(`Commande mise à jour : ${statut}`);
  };

  const supprimerCommande = (id: string) => {
    const cmd = commandes.find(c => c.id === id);
    setCommandes(prev => prev.filter(c => c.id !== id));
    speak(`Commande ${cmd?.produit} supprimée`);
    setShowDetailModal(false);
  };

  const ajouterCommande = () => {
    if (!newForm.produit || !newForm.acheteur || !newForm.quantite || !newForm.prixUnitaire) return;
    const nouvelle: Commande = {
      id: `CMD-${Date.now()}`,
      produit: newForm.produit,
      image: 'https://images.unsplash.com/photo-1763537351442-f377a4878d9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      acheteur: newForm.acheteur,
      telephone: newForm.telephone,
      localite: newForm.localite,
      quantite: newForm.quantite,
      unite: newForm.unite,
      prixUnitaire: newForm.prixUnitaire,
      prixTotal: newForm.quantite * newForm.prixUnitaire,
      statut: 'nouvelle',
      dateCommande: new Date().toISOString().split('T')[0],
      dateLivraison: newForm.dateLivraison,
      categorie: newForm.categorie,
      progression: 10,
      prime: 0,
    };
    setCommandes(prev => [nouvelle, ...prev]);
    speak(`Commande de ${newForm.produit} ajoutée`);
    setShowAddModal(false);
    setNewForm(emptyForm);
  };

  // ── Voice ──────────────────────────────────────────────────────────────────
  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      speak('La reconnaissance vocale n\'est pas disponible sur ce navigateur');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const txt = e.results[0][0].transcript.toLowerCase();
      setIsListening(false);
      if (txt.includes('nouvelle') || txt.includes('urgente')) {
        setActiveFilter('urgentes');
        speak('Voici tes commandes urgentes');
      } else if (txt.includes('revenus') || txt.includes('encaissé')) {
        setShowRevenusModal(true);
        speak('Voici tes revenus');
      } else if (txt.includes('toutes') || txt.includes('tout')) {
        setActiveFilter('all');
        speak('Voici toutes tes commandes');
      } else {
        setSearchQuery(txt);
        speak(`Je cherche : ${txt}`);
      }
    };
    rec.start();
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── HEADER FIXE ──────────────────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: '#f0fdf4' }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 pt-10 pb-3 lg:pt-4 lg:pb-3 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">
              Mes Commandes
            </h1>
            <NotificationButton />
            <motion.button
              onClick={() => setShowFilterModal(true)}
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── CONTENU ───────────────────────────────────────────────────────── */}
      <div
        className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen"
        style={{ background: 'linear-gradient(to bottom, #f0fdf4, white)' }}
      >

        {/* ── KPIs 2×2 interactifs ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          {/* KPI 1 — Total commandes → filtre all */}
          <motion.button
            onClick={() => { setActiveFilter('all'); speak('Toutes les commandes'); }}
            className={`relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${
              activeFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.04, y: -3, boxShadow: '0 10px 30px rgba(59,130,246,0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Commandes</p>
              <motion.div
                className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ShoppingBag className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <p className="text-3xl font-bold text-blue-600">{commandes.length}</p>
            {activeFilter === 'all' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-blue-500" />
            )}
          </motion.button>

          {/* KPI 2 — Urgentes → filtre urgentes */}
          <motion.button
            onClick={() => { setActiveFilter('urgentes'); speak('Commandes urgentes'); }}
            className={`relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${
              activeFilter === 'urgentes' ? 'border-orange-500 ring-2 ring-orange-300' : 'border-orange-300'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.04, y: -3, boxShadow: '0 10px 30px rgba(249,115,22,0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Urgentes</p>
              <motion.div
                className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center"
                animate={urgentes.length > 0 ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <AlertCircle className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.p
              className="text-3xl font-bold text-orange-600"
              animate={urgentes.length > 0 ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {urgentes.length}
            </motion.p>
            {activeFilter === 'urgentes' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-orange-500" />
            )}
          </motion.button>

          {/* KPI 3 — Revenus → ouvre modal revenus (remplace bouton "Mes revenus") */}
          <motion.button
            onClick={() => { setShowRevenusModal(true); speak('Mes revenus'); }}
            className={`relative bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${
              showRevenusModal ? 'border-green-500 ring-2 ring-green-300' : 'border-green-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.04, y: -3, boxShadow: '0 10px 30px rgba(34,197,94,0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Revenus</p>
              <motion.div
                className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <p className="text-base font-bold text-green-600 leading-tight">
              {totalRevenus.toLocaleString('fr-FR')} FCFA
            </p>
            {showRevenusModal && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-green-500" />
            )}
          </motion.button>

          {/* KPI 4 — Livrées → filtre livrees */}
          <motion.button
            onClick={() => { setActiveFilter('livrees'); speak('Commandes livrées'); }}
            className={`relative bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${
              activeFilter === 'livrees' ? 'border-purple-500 ring-2 ring-purple-300' : 'border-purple-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.04, y: -3, boxShadow: '0 10px 30px rgba(168,85,247,0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Livrées</p>
              <motion.div
                className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center"
                animate={{ rotate: [0, 0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <CheckCircle className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
              </motion.div>
            </div>
            <p className="text-3xl font-bold text-purple-600">{encaissees.length}</p>
            {activeFilter === 'livrees' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-purple-500" />
            )}
          </motion.button>

        </div>

        {/* ── Barre de recherche ── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande ou un acheteur..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:outline-none"
              style={{ borderColor: searchQuery ? COLOR : undefined }}
            />
            <motion.button
              onClick={startVoice}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isListening
                ? <MicOff className="w-5 h-5" style={{ color: COLOR }} />
                : <Mic className="w-5 h-5 text-gray-300" />
              }
            </motion.button>
          </div>
        </motion.div>

        {/* ── Bouton d'action ── */}
        <div className="mb-4">
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 rounded-2xl bg-white border-2 font-bold flex items-center justify-center gap-2"
            style={{ borderColor: COLOR, color: COLOR }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            Ajouter une commande
          </motion.button>
        </div>

        {/* ══ DEMANDES DE MARCHANDS — sous le bouton, disparaissent quand traitées ══ */}
        <AnimatePresence>
          {demandesEnAttente.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="mb-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <Bell className="w-5 h-5" style={{ color: COLOR }} strokeWidth={2.5} />
                  <motion.span
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"
                  />
                </div>
                <span className="font-black text-gray-900 text-base">Demandes de marchands</span>
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-orange-500">
                  {demandesEnAttente.length} à traiter
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {demandesEnAttente.map((cmd, idx) => {
                    const statutInfo = getCtxStatutLabel(cmd.status);
                    const countdown = formatCountdown(cmd.expiresAt);
                    const prixAffiche = cmd.prixNegocie ?? cmd.prixInitial;
                    const lastMsg = cmd.negotiationHistory.length > 0
                      ? cmd.negotiationHistory[cmd.negotiationHistory.length - 1].message
                      : null;

                    return (
                      <motion.div
                        key={cmd.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60, height: 0, overflow: 'hidden' }}
                        transition={{ delay: idx * 0.07, type: 'spring', stiffness: 260, damping: 26 }}
                        onClick={() => { setSelectedDemande(cmd); setShowDemandeDetailModal(true); speak(`Demande de ${cmd.buyerName} pour ${cmd.productName}`); }}
                        className="rounded-3xl border-2 overflow-hidden cursor-pointer shadow-md"
                        style={{
                          borderColor: '#f97316',
                          background: 'linear-gradient(135deg, #fff7ed, white)',
                        }}
                        whileHover={{ scale: 1.02, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Header */}
                        <div className="px-4 pt-3 pb-2 flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: statutInfo.bg, color: statutInfo.color }}
                              >
                                {statutInfo.label}
                              </span>
                              <motion.span
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-[10px] font-bold text-orange-500"
                              >
                                {countdown}
                              </motion.span>
                            </div>
                            <p className="font-black text-gray-900 text-base leading-tight">{cmd.productName}</p>
                            <p className="text-sm text-gray-500 font-semibold">{cmd.buyerName}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        </div>

                        {/* Infos financières */}
                        <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                          <div className="bg-white/80 rounded-2xl p-2 text-center">
                            <p className="text-[10px] text-gray-500 font-semibold">Quantité</p>
                            <p className="font-bold text-gray-900 text-sm">{cmd.quantity.toLocaleString('fr-FR')} {cmd.uniteProduit}</p>
                          </div>
                          <div className="bg-white/80 rounded-2xl p-2 text-center">
                            <p className="text-[10px] text-gray-500 font-semibold">Prix proposé</p>
                            <p className="font-bold text-sm text-orange-600">{prixAffiche.toLocaleString('fr-FR')} F</p>
                          </div>
                          <div className="bg-white/80 rounded-2xl p-2 text-center">
                            <p className="text-[10px] text-gray-500 font-semibold">Total</p>
                            <p className="font-bold text-gray-900 text-sm">{cmd.montantTotal.toLocaleString('fr-FR')}</p>
                          </div>
                        </div>

                        {/* Message du marchand */}
                        {lastMsg && (
                          <div className="px-4 pb-3">
                            <div className="bg-orange-50 rounded-2xl px-3 py-2 border border-orange-200">
                              <p className="text-xs text-orange-800 italic leading-relaxed">"{lastMsg}"</p>
                            </div>
                          </div>
                        )}

                        {/* Boutons action — EN_ATTENTE */}
                        {cmd.status === CommandeStatus.EN_ATTENTE && (
                          <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                            <motion.button
                              onClick={e => { e.stopPropagation(); handleAccepterDemande(cmd); }}
                              className="py-2.5 rounded-2xl font-bold text-white text-xs flex items-center justify-center gap-1"
                              style={{ backgroundColor: COLOR }}
                              whileTap={{ scale: 0.93 }}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                              Accepter
                            </motion.button>
                            <motion.button
                              onClick={e => { e.stopPropagation(); setSelectedDemande(cmd); setNouveauPrix(cmd.prixInitial); setShowContrePropoModal(true); }}
                              className="py-2.5 rounded-2xl font-bold text-white text-xs flex items-center justify-center gap-1 bg-purple-500"
                              whileTap={{ scale: 0.93 }}
                            >
                              <MessageSquare className="w-3.5 h-3.5" strokeWidth={2.5} />
                              Négocier
                            </motion.button>
                            <motion.button
                              onClick={e => { e.stopPropagation(); setSelectedDemande(cmd); setShowRefusModal(true); }}
                              className="py-2.5 rounded-2xl font-bold text-white text-xs flex items-center justify-center gap-1 bg-red-500"
                              whileTap={{ scale: 0.93 }}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                              Refuser
                            </motion.button>
                          </div>
                        )}

                        {/* EN_NEGOCIATION — contre-proposition envoyée */}
                        {cmd.status === CommandeStatus.EN_NEGOCIATION && (
                          <div className="px-4 pb-4">
                            <div className="bg-purple-50 rounded-2xl p-3 border border-purple-200">
                              <p className="text-xs font-bold text-purple-700 mb-1">Contre-proposition envoyée</p>
                              <p className="text-sm text-purple-900 font-semibold">
                                {(cmd.prixNegocie || 0).toLocaleString('fr-FR')} FCFA/{cmd.uniteProduit} — en attente du marchand
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grille de commandes ── */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.length === 0 && (
            <motion.div
              className="col-span-2 text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">Aucune commande trouvée</p>
            </motion.div>
          )}
          {filtered.map((cmd, index) => {
            const cfg = STATUT_CONFIG[cmd.statut];
            const isUrgent = cmd.statut === 'nouvelle' || cmd.statut === 'litige';
            const isFromNego = commandesNegoTerminees.some(n => n.id === cmd.id);

            return (
              <motion.div
                key={cmd.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => { setSelectedCmd(cmd); setShowDetailModal(true); }}
                className={`rounded-3xl overflow-hidden shadow-md border-2 cursor-pointer ${
                  isUrgent
                    ? 'border-orange-300'
                    : 'border-gray-200'
                }`}
                style={{
                  background: isUrgent
                    ? 'linear-gradient(135deg, #fff7ed, white, #fff7ed)'
                    : 'linear-gradient(135deg, #f0fdf4, white, #f0fdf4)',
                }}
                whileHover={{ scale: 1.02, y: -4, boxShadow: '0 10px 30px rgba(46,139,87,0.15)' }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Image */}
                <div className="relative w-full h-36 overflow-hidden">
                  <ImageWithFallback
                    src={cmd.image}
                    alt={cmd.produit}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge statut urgent */}
                  {isUrgent && (
                    <div className="absolute top-2 right-2">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {cmd.statut === 'litige' ? 'Litige' : 'Nouveau'}
                      </motion.span>
                    </div>
                  )}
                  {/* Badge prime qualité */}
                  {cmd.prime > 0 && !isFromNego && (
                    <div className="absolute top-2 left-2">
                      <span
                        className="text-xs text-white px-2 py-1 rounded-lg font-bold shadow-lg"
                        style={{ backgroundColor: COLOR }}
                      >
                        +{cmd.prime}%
                      </span>
                    </div>
                  )}
                  {/* Badge négociation — commandes issues d'une négociation traitée */}
                  {isFromNego && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 left-2"
                    >
                      <span className="inline-flex items-center gap-1 text-xs text-white px-2 py-1 rounded-lg font-bold shadow-lg bg-purple-500">
                        <MessageSquare className="w-3 h-3" strokeWidth={2.5} />
                        Négo
                      </span>
                    </motion.div>
                  )}
                  {/* Gradient + nom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="font-bold text-white text-sm drop-shadow-lg">{cmd.produit}</h3>
                  </div>
                </div>

                {/* Infos sous l'image */}
                <div className="p-3 space-y-2">
                  {/* Quantité en grand */}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold" style={{ color: isUrgent ? '#ea580c' : COLOR }}>
                      {cmd.quantite}
                    </span>
                    <span className="text-sm text-gray-500 font-semibold">{cmd.unite}</span>
                  </div>

                  {/* Acheteur + Prix */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-blue-50 rounded-lg p-1.5 text-center">
                      <p className="text-blue-600 font-semibold mb-0.5">Acheteur</p>
                      <p className="font-bold text-gray-900 text-[10px] leading-tight truncate">{cmd.acheteur.split(' ')[0]}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-1.5 text-center">
                      <p className="text-green-600 font-semibold mb-0.5">Prix/u</p>
                      <p className="font-bold text-gray-900 text-[10px] leading-tight">{cmd.prixUnitaire.toLocaleString('fr-FR')}</p>
                    </div>
                  </div>

                  {/* Barre de progression livraison */}
                  <div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cfg.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cmd.progression}%` }}
                        transition={{ duration: 1, delay: index * 0.05 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── NAVIGATION ────────────────────────────────────────────────────── */}
      <Navigation role="producteur" onMicClick={startVoice} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL AJOUT                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setNewForm(emptyForm); }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal centré — style CreerCycleModal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              {/* ── Header gradient vert */}
              <div className="bg-gradient-to-r from-[#2E8B57] to-[#3BA869] px-6 py-5 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6" strokeWidth={2.5} />
                    Nouvelle commande
                  </h2>
                  <p className="text-white/85 text-sm mt-1">Enregistre une vente avec un acheteur</p>
                </div>
                <button
                  onClick={() => { setShowAddModal(false); setNewForm(emptyForm); }}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center hover:bg-white/40 transition-colors mt-0.5"
                >
                  <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
              </div>

              {/* ── Contenu scrollable */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                <div className="p-5 space-y-6 bg-white">

                  {/* ── Produit — grille d'icônes */}
                  <div>
                    <label className="block font-black text-gray-900 text-base mb-3">
                      Quel produit tu vends ?
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRODUITS_ICONS.map((p) => {
                        const isSelected = newForm.produit === p.id;
                        return (
                          <motion.button
                            key={p.id}
                            onClick={() => { setNewForm({ ...newForm, produit: p.id }); speak(p.id); }}
                            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 px-1 border-2 transition-all ${
                              isSelected
                                ? 'border-transparent shadow-lg'
                                : 'bg-white border-gray-200 hover:border-green-300'
                            }`}
                            style={isSelected ? { backgroundColor: `${COLOR}18`, borderColor: COLOR } : {}}
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.04, y: -2 }}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                              <img src={p.img} alt={p.id} className="w-9 h-9 object-contain" />
                            </div>
                            <span
                              className="text-[10px] font-bold leading-tight text-center"
                              style={{ color: isSelected ? COLOR : '#6b7280' }}
                            >
                              {p.id}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Champ texte si "Autre" */}
                    <AnimatePresence>
                      {newForm.produit === 'Autre' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <input
                            type="text"
                            placeholder="Ex: Tomate cerise, Piment oiseau..."
                            className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none font-semibold text-base text-gray-900 bg-white placeholder:text-gray-400"
                            style={{ borderColor: COLOR }}
                            autoFocus
                            onChange={e => setNewForm({ ...newForm, produit: e.target.value || 'Autre' })}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── Acheteur */}
                  <div>
                    <label className="block font-black text-gray-900 text-base mb-3">
                      Qui est l'acheteur ?
                    </label>
                    <input
                      type="text"
                      value={newForm.acheteur}
                      onChange={e => setNewForm({ ...newForm, acheteur: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border border-gray-300 focus:outline-none font-semibold text-base text-gray-900 bg-white placeholder:text-gray-400"
                      style={{ borderColor: newForm.acheteur ? COLOR : undefined }}
                      placeholder="Nom complet de l'acheteur"
                    />
                  </div>

                  {/* ── Téléphone + Localité */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-gray-900 text-base mb-3">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={newForm.telephone}
                        onChange={e => setNewForm({ ...newForm, telephone: e.target.value })}
                        className="w-full px-4 py-4 rounded-2xl border border-gray-300 focus:outline-none font-semibold text-base text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="07 00 00 00"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-gray-900 text-base mb-3">
                        Localité
                      </label>
                      <input
                        type="text"
                        value={newForm.localite}
                        onChange={e => setNewForm({ ...newForm, localite: e.target.value })}
                        className="w-full px-4 py-4 rounded-2xl border border-gray-300 focus:outline-none font-semibold text-base text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Abidjan"
                      />
                    </div>
                  </div>

                  {/* ── Quantité + Unité */}
                  <div>
                    <label className="block font-black text-gray-900 text-base mb-3">
                      Combien de quantité ?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={newForm.quantite || ''}
                        onChange={e => setNewForm({ ...newForm, quantite: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-4 rounded-2xl border border-gray-300 focus:outline-none font-black text-2xl text-gray-900 bg-white"
                        placeholder="0"
                      />
                      <div className="grid grid-cols-3 gap-1.5">
                        {['kg', 'tas', 'sac', 'L', 'régimes', 'unité'].map(u => (
                          <motion.button
                            key={u}
                            onClick={() => { setNewForm({ ...newForm, unite: u }); speak(u); }}
                            className={`py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                              newForm.unite === u
                                ? 'text-white border-transparent shadow-md'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                            }`}
                            style={newForm.unite === u ? { backgroundColor: COLOR, borderColor: COLOR } : {}}
                            whileTap={{ scale: 0.93 }}
                          >
                            {u}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Prix unitaire */}
                  <div>
                    <label className="block font-black text-gray-900 text-base mb-3">
                      Prix par unité (FCFA)
                    </label>
                    <input
                      type="number"
                      value={newForm.prixUnitaire || ''}
                      onChange={e => setNewForm({ ...newForm, prixUnitaire: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-4 rounded-2xl border border-gray-300 focus:outline-none font-black text-3xl text-gray-900 bg-white"
                      placeholder="0"
                    />
                  </div>

                  {/* ── Catégorie + Date livraison */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-gray-900 text-base mb-3">Catégorie</label>
                      <select
                        value={newForm.categorie}
                        onChange={e => setNewForm({ ...newForm, categorie: e.target.value })}
                        className="w-full px-4 py-4 rounded-2xl border border-gray-300 focus:outline-none font-semibold text-sm text-gray-900 bg-white"
                      >
                        {categories.filter(c => c.id !== 'tous').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-gray-900 text-base mb-3">Livraison</label>
                      <input
                        type="date"
                        value={newForm.dateLivraison}
                        onChange={e => setNewForm({ ...newForm, dateLivraison: e.target.value })}
                        className="w-full px-4 py-4 rounded-2xl border border-gray-300 focus:outline-none font-semibold text-sm text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* ── Récapitulatif montant */}
                  <AnimatePresence>
                    {newForm.quantite > 0 && newForm.prixUnitaire > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl p-4 border-2"
                        style={{ borderColor: COLOR, backgroundColor: `${COLOR}08` }}
                      >
                        <p className="text-sm text-gray-600 font-semibold">Montant total estimé</p>
                        <p className="text-2xl font-black mt-1" style={{ color: COLOR }}>
                          {(newForm.quantite * newForm.prixUnitaire).toLocaleString('fr-FR')} FCFA
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Boutons */}
                  <div className="flex gap-3 pt-2 pb-2">
                    <button
                      onClick={() => { setShowAddModal(false); setNewForm(emptyForm); }}
                      className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-base"
                    >
                      Annuler
                    </button>
                    <motion.button
                      onClick={ajouterCommande}
                      disabled={!newForm.produit || !newForm.acheteur || !newForm.quantite || !newForm.prixUnitaire}
                      className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg disabled:opacity-50 transition-all text-base"
                      style={{ backgroundColor: COLOR }}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      Enregistrer
                    </motion.button>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL DÉTAIL COMMANDE                                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDetailModal && selectedCmd && (() => {
          const cfg = STATUT_CONFIG[selectedCmd.statut];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end px-4 pb-4"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                  <h2 className="text-xl font-bold">Détail commande</h2>
                  <motion.button
                    onClick={() => setShowDetailModal(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="w-full">
                  {/* Image hero */}
                  <div className="relative w-full h-64">
                    <ImageWithFallback
                      src={selectedCmd.image}
                      alt={selectedCmd.produit}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white drop-shadow-2xl mb-2">{selectedCmd.produit}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{ backgroundColor: cfg.color, color: 'white' }}
                        >
                          {cfg.label}
                        </span>
                        {selectedCmd.prime > 0 && (
                          <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold border border-white/30">
                            Prime +{selectedCmd.prime}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Corps */}
                  <div className="px-6 py-6 space-y-5">
                    {/* Barre de progression */}
                    <div className="rounded-2xl p-4" style={{ backgroundColor: `${cfg.color}10` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">Progression</p>
                        <p className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.label} — {selectedCmd.progression}%</p>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: cfg.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedCmd.progression}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>

                    {/* Infos quantité */}
                    <div className="rounded-2xl p-4" style={{ backgroundColor: `${COLOR}08` }}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Quantité commandée</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold" style={{ color: COLOR }}>{selectedCmd.quantite}</span>
                        <span className="text-lg text-gray-500 font-semibold">{selectedCmd.unite}</span>
                      </div>
                    </div>

                    {/* Finances */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Prix unitaire</span>
                        <span className="font-bold">{selectedCmd.prixUnitaire.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quantité</span>
                        <span className="font-bold">{selectedCmd.quantite} {selectedCmd.unite}</span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-sm text-gray-600">Montant total</span>
                        <span className="text-base font-bold" style={{ color: COLOR }}>
                          {selectedCmd.prixTotal.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Acheteur */}
                    <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
                      <p className="text-sm font-bold text-gray-700 mb-1">Acheteur</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800">{selectedCmd.acheteur}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <a href={`tel:${selectedCmd.telephone}`} className="font-semibold text-blue-700">{selectedCmd.telephone}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800">{selectedCmd.localite}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Livraison : {selectedCmd.dateLivraison}</span>
                      </div>
                    </div>

                    {/* Changement de statut */}
                    {selectedCmd.statut !== 'cloturee' && selectedCmd.statut !== 'livree' && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-gray-700">Mettre à jour le statut</p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedCmd.statut === 'nouvelle' && (
                            <motion.button
                              onClick={() => changerStatut(selectedCmd.id, 'acceptee')}
                              className="py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
                              style={{ backgroundColor: '#3b82f6' }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <CheckCircle className="w-4 h-4" /> Accepter
                            </motion.button>
                          )}
                          {selectedCmd.statut === 'acceptee' && (
                            <motion.button
                              onClick={() => changerStatut(selectedCmd.id, 'preparation')}
                              className="py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
                              style={{ backgroundColor: '#a855f7' }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Package className="w-4 h-4" /> Préparer
                            </motion.button>
                          )}
                          {selectedCmd.statut === 'preparation' && (
                            <motion.button
                              onClick={() => changerStatut(selectedCmd.id, 'livree')}
                              className="py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
                              style={{ backgroundColor: '#10b981' }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Truck className="w-4 h-4" /> Livrer
                            </motion.button>
                          )}
                          {selectedCmd.statut === 'litige' && (
                            <motion.button
                              onClick={() => changerStatut(selectedCmd.id, 'cloturee')}
                              className="py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 col-span-2"
                              style={{ backgroundColor: '#6b7280' }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <CheckCircle className="w-4 h-4" /> Clôturer le litige
                            </motion.button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Supprimer */}
                    <motion.button
                      onClick={() => supprimerCommande(selectedCmd.id)}
                      className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold flex items-center justify-center gap-2"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Trash2 className="w-5 h-5" />
                      Supprimer la commande
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL FILTRES                                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end px-4 pb-4"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Filtres et tri</h2>
                <motion.button
                  onClick={() => setShowFilterModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-6 space-y-6">
                {/* Statut */}
                <div>
                  <h3 className="font-bold mb-3">Statut</h3>
                  <div className="space-y-2">
                    {statuts.map(st => (
                      <button
                        key={st.id}
                        onClick={() => { setSelectedStatut(st.id); setShowFilterModal(false); }}
                        className="w-full px-4 py-3 rounded-xl text-left font-semibold"
                        style={{
                          backgroundColor: selectedStatut === st.id ? COLOR : '#F3F4F6',
                          color: selectedStatut === st.id ? 'white' : '#374151',
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <h3 className="font-bold mb-3">Catégorie</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategorie(cat.id); setShowFilterModal(false); }}
                        className="w-full px-4 py-3 rounded-xl text-left font-semibold"
                        style={{
                          backgroundColor: selectedCategorie === cat.id ? COLOR : '#F3F4F6',
                          color: selectedCategorie === cat.id ? 'white' : '#374151',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tri */}
                <div>
                  <h3 className="font-bold mb-3">Trier par</h3>
                  <div className="space-y-2">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setSortBy(opt.id); setShowFilterModal(false); }}
                        className="w-full px-4 py-3 rounded-xl text-left font-semibold"
                        style={{
                          backgroundColor: sortBy === opt.id ? COLOR : '#F3F4F6',
                          color: sortBy === opt.id ? 'white' : '#374151',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL REVENUS                                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRevenusModal && (() => {
          const enAttente = commandes.filter(c => !['livree','cloturee'].includes(c.statut));
          const encaisse = commandes.filter(c => ['livree','cloturee'].includes(c.statut));
          const revEnAttente = enAttente.reduce((s, c) => s + c.prixTotal, 0);
          const revEncaisse = encaisse.reduce((s, c) => s + c.prixTotal, 0);
          const revTotal = revEnAttente + revEncaisse;

          const catStats = categories
            .filter(c => c.id !== 'tous')
            .map(cat => {
              const items = commandes.filter(c => c.categorie === cat.id);
              const val = items.reduce((s, c) => s + c.prixTotal, 0);
              return { ...cat, val, count: items.length };
            })
            .filter(c => c.count > 0)
            .sort((a, b) => b.val - a.val);

          const maxCat = Math.max(...catStats.map(c => c.val), 1);

          const top3 = [...commandes]
            .sort((a, b) => b.prixTotal - a.prixTotal)
            .slice(0, 3);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end px-4 pb-4"
              onClick={() => setShowRevenusModal(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
              >
                {/* Header */}
                <div
                  className="sticky top-0 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10"
                  style={{ background: `linear-gradient(135deg, ${COLOR}, #1a5c38)` }}
                >
                  <div>
                    <h2 className="text-xl font-bold text-white">Revenus Commandes</h2>
                    <p className="text-sm mt-0.5" style={{ color: '#a7f3d0' }}>Analyse financière complète</p>
                  </div>
                  <motion.button
                    onClick={() => setShowRevenusModal(false)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                <div className="p-6 space-y-6">
                  {/* KPIs financiers */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border-2 border-orange-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">En attente</p>
                      </div>
                      <p className="text-xl font-bold text-orange-600">
                        {revEnAttente.toLocaleString('fr-FR')} FCFA
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{enAttente.length} commande{enAttente.length > 1 ? 's' : ''}</p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border-2 border-green-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Encaissé</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        {revEncaisse.toLocaleString('fr-FR')} FCFA
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{encaisse.length} commande{encaisse.length > 1 ? 's' : ''}</p>
                    </motion.div>

                    <motion.div
                      className="col-span-2 rounded-2xl p-4 border-2"
                      style={{ background: `linear-gradient(135deg, ${COLOR}15, ${COLOR}08)`, borderColor: `${COLOR}40` }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLOR }}>
                          <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Portefeuille total</p>
                      </div>
                      <p className="text-2xl font-bold" style={{ color: COLOR }}>
                        {revTotal.toLocaleString('fr-FR')} FCFA
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{commandes.length} commandes au total</p>
                    </motion.div>
                  </div>

                  {/* Répartition par catégorie */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Filter className="w-4 h-4 text-white" />
                      </div>
                      Répartition par catégorie
                    </h3>
                    <div className="space-y-3">
                      {catStats.map((cat, i) => (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
                            <span className="text-xs font-bold text-blue-600">
                              {cat.val.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                          <div className="h-2.5 bg-white rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${COLOR}, #1a5c38)` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(cat.val / maxCat) * 100}%` }}
                              transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{cat.count} commande{cat.count > 1 ? 's' : ''}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Top 3 commandes */}
                  <motion.div
                    className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border-2 border-amber-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Top 3 commandes par valeur
                    </h3>
                    <div className="space-y-3">
                      {top3.map((cmd, i) => (
                        <motion.div
                          key={cmd.id}
                          className="bg-white rounded-xl p-3 flex items-center gap-3"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                            i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-600'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">{cmd.produit}</p>
                            <p className="text-xs text-gray-500 truncate">{cmd.acheteur}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm" style={{ color: COLOR }}>
                              {cmd.prixTotal.toLocaleString('fr-FR')} FCFA
                            </p>
                            <p className="text-xs text-gray-500">{cmd.quantite} {cmd.unite}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL DÉTAIL DEMANDE MARCHAND                                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDemandeDetailModal && selectedDemande && (() => {
          const statutInfo = getCtxStatutLabel(selectedDemande.status);
          const prixAffiche = selectedDemande.prixNegocie ?? selectedDemande.prixInitial;
          const countdown = formatCountdown(selectedDemande.expiresAt);
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDemandeDetailModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 30 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
                style={{ maxHeight: '90vh' }}
              >
                {/* Header */}
                <div
                  className="px-6 py-5 flex items-start justify-between"
                  style={{ background: `linear-gradient(135deg, ${COLOR}, #1a5c38)` }}
                >
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
                      Demande de {selectedDemande.buyerName}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">{selectedDemande.numeroCommande}</p>
                  </div>
                  <button
                    onClick={() => setShowDemandeDetailModal(false)}
                    className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center hover:bg-white/40 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 90px)' }}>
                  <div className="p-5 space-y-4">

                    {/* Statut + countdown */}
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between border-2"
                      style={{ backgroundColor: statutInfo.bg, borderColor: `${statutInfo.color}40` }}
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Statut de la demande</p>
                        <p className="font-black text-lg mt-0.5" style={{ color: statutInfo.color }}>{statutInfo.label}</p>
                      </div>
                      {countdown && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Expire dans</p>
                          <motion.p
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-sm font-bold text-orange-500"
                          >
                            {countdown}
                          </motion.p>
                        </div>
                      )}
                    </div>

                    {/* Produit + montants */}
                    <div className="rounded-2xl p-4 border-2 border-gray-100 bg-gray-50 space-y-3">
                      <p className="font-black text-gray-900 text-lg">{selectedDemande.productName}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-xl p-2.5 text-center">
                          <p className="text-[10px] text-gray-500 font-semibold">Quantité</p>
                          <p className="font-bold text-gray-900">{selectedDemande.quantity.toLocaleString('fr-FR')}</p>
                          <p className="text-[10px] text-gray-400">{selectedDemande.uniteProduit}</p>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 text-center">
                          <p className="text-[10px] text-gray-500 font-semibold">Prix proposé</p>
                          <p className="font-bold" style={{ color: COLOR }}>{selectedDemande.prixInitial.toLocaleString('fr-FR')}</p>
                          <p className="text-[10px] text-gray-400">FCFA/{selectedDemande.uniteProduit}</p>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 text-center">
                          <p className="text-[10px] text-gray-500 font-semibold">Montant</p>
                          <p className="font-bold text-gray-900 text-sm">{selectedDemande.montantTotal.toLocaleString('fr-FR')}</p>
                          <p className="text-[10px] text-gray-400">FCFA</p>
                        </div>
                      </div>
                      {selectedDemande.prixNegocie && (
                        <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                          <p className="text-xs text-purple-600 font-bold">Contre-proposition envoyée</p>
                          <p className="font-black text-purple-800">{selectedDemande.prixNegocie.toLocaleString('fr-FR')} FCFA/{selectedDemande.uniteProduit}</p>
                        </div>
                      )}
                    </div>

                    {/* Acheteur */}
                    <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-100">
                      <p className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Acheteur
                      </p>
                      <p className="font-black text-gray-900">{selectedDemande.buyerName}</p>
                      <p className="text-sm text-blue-600 font-semibold capitalize">{selectedDemande.buyerRole}</p>
                    </div>

                    {/* Historique négociation */}
                    {selectedDemande.negotiationHistory.length > 0 && (
                      <div className="rounded-2xl border-2 border-purple-100 bg-purple-50 p-4">
                        <p className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                          Historique négociation
                        </p>
                        <div className="space-y-2">
                          {selectedDemande.negotiationHistory.map((neg, i) => (
                            <div key={neg.id} className="bg-white rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold ${neg.proposerRole === 'producteur' ? 'text-green-600' : 'text-blue-600'}`}>
                                  {neg.proposerRole === 'producteur' ? 'Toi (Producteur)' : 'Marchand'}
                                </span>
                                <span className="text-xs text-gray-400">Tour {neg.round}</span>
                              </div>
                              <p className="font-black text-gray-900">{neg.prixPropose.toLocaleString('fr-FR')} FCFA/{selectedDemande.uniteProduit}</p>
                              {neg.message && <p className="text-xs text-gray-500 mt-1 italic">{neg.message}</p>}
                              {neg.response && (
                                <span className={`text-xs font-bold ${neg.response === 'ACCEPTED' ? 'text-green-600' : 'text-red-500'}`}>
                                  {neg.response === 'ACCEPTED' ? 'Acceptée' : 'Rejetée'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {selectedDemande.status === CommandeStatus.EN_ATTENTE && (
                      <div className="space-y-2 pt-2">
                        <motion.button
                          onClick={() => handleAccepterDemande(selectedDemande)}
                          disabled={isSubmittingDemande}
                          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ backgroundColor: COLOR }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <ThumbsUp className="w-5 h-5" strokeWidth={2.5} />
                          {isSubmittingDemande ? 'Traitement...' : 'Accepter la demande'}
                        </motion.button>
                        <div className="grid grid-cols-2 gap-2">
                          <motion.button
                            onClick={() => { setNouveauPrix(selectedDemande.prixInitial); setShowContrePropoModal(true); }}
                            className="py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-1.5 bg-purple-500"
                            whileTap={{ scale: 0.97 }}
                          >
                            <MessageSquare className="w-4 h-4" strokeWidth={2.5} />
                            Négocier
                          </motion.button>
                          <motion.button
                            onClick={() => setShowRefusModal(true)}
                            className="py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-1.5 bg-red-500"
                            whileTap={{ scale: 0.97 }}
                          >
                            <ThumbsDown className="w-4 h-4" strokeWidth={2.5} />
                            Refuser
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {selectedDemande.status === CommandeStatus.PAYEE && (
                      <motion.button
                        onClick={() => handleMarquerLivre(selectedDemande)}
                        disabled={isSubmittingDemande}
                        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 bg-emerald-500 disabled:opacity-50"
                        whileTap={{ scale: 0.97 }}
                      >
                        <Truck className="w-5 h-5" strokeWidth={2.5} />
                        {isSubmittingDemande ? 'Traitement...' : 'Confirmer la livraison'}
                      </motion.button>
                    )}

                    {selectedDemande.status === CommandeStatus.LIVREE && (
                      <motion.button
                        onClick={() => handleRecupererPaiement(selectedDemande)}
                        disabled={isSubmittingDemande}
                        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ backgroundColor: COLOR }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Banknote className="w-5 h-5" strokeWidth={2.5} />
                        {isSubmittingDemande ? 'Traitement...' : 'Récupérer mon argent'}
                      </motion.button>
                    )}

                    {/* Infos status non-actionnable */}
                    {[CommandeStatus.ACCEPTEE, CommandeStatus.EN_NEGOCIATION, CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND].includes(selectedDemande.status) && (
                      <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <div>
                          <p className="font-bold text-amber-800 text-sm">
                            {selectedDemande.status === CommandeStatus.ACCEPTEE && 'En attente du paiement marchand. Tu recevras une notification dès qu\'il paie.'}
                            {selectedDemande.status === CommandeStatus.EN_NEGOCIATION && 'Ta contre-proposition est envoyée. En attente de la réponse du marchand.'}
                            {selectedDemande.status === CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND && 'Livraison déclarée. Le marchand a 48h pour confirmer la réception.'}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL CONTRE-PROPOSITION                                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showContrePropoModal && selectedDemande && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContrePropoModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white rounded-3xl shadow-2xl z-[111] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-5 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" strokeWidth={2.5} />
                    Proposer ton prix
                  </h2>
                  <p className="text-white/80 text-sm mt-1">Prix actuel : {selectedDemande.prixInitial.toLocaleString('fr-FR')} FCFA/{selectedDemande.uniteProduit}</p>
                </div>
                <button
                  onClick={() => setShowContrePropoModal(false)}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center hover:bg-white/40"
                >
                  <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Saisie prix */}
                <div>
                  <label className="block font-black text-gray-900 text-base mb-3">
                    Ton prix (FCFA/{selectedDemande.uniteProduit})
                  </label>
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => setNouveauPrix(p => Math.max(50, p - 50))}
                      className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-xl text-gray-700"
                      whileTap={{ scale: 0.9 }}
                    >
                      -
                    </motion.button>
                    <input
                      type="number"
                      value={nouveauPrix || ''}
                      onChange={e => setNouveauPrix(parseInt(e.target.value) || 0)}
                      className="flex-1 px-4 py-4 rounded-2xl border-2 focus:outline-none font-black text-3xl text-gray-900 text-center bg-white"
                      style={{ borderColor: '#8b5cf6' }}
                    />
                    <motion.button
                      onClick={() => setNouveauPrix(p => p + 50)}
                      className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-xl text-gray-700"
                      whileTap={{ scale: 0.9 }}
                    >
                      +
                    </motion.button>
                  </div>
                  {/* Comparaison */}
                  {nouveauPrix > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-2xl p-3 bg-purple-50 border border-purple-200"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Prix marchand</span>
                        <span className="font-bold text-gray-400 line-through">{selectedDemande.prixInitial.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Ton prix</span>
                        <span className="font-black text-purple-700">{nouveauPrix.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1 border-t border-purple-200 pt-2">
                        <span className="text-gray-600">Nouveau total</span>
                        <span className="font-black text-purple-700">{(nouveauPrix * selectedDemande.quantity).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Message optionnel */}
                <div>
                  <label className="block font-black text-gray-900 text-sm mb-2">Message (facultatif)</label>
                  <textarea
                    value={messageContrePropo}
                    onChange={e => setMessageContrePropo(e.target.value)}
                    placeholder="Ex: Ce prix correspond à la qualité extra de ma récolte..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none font-semibold text-sm text-gray-700 resize-none"
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowContrePropoModal(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <motion.button
                    onClick={handleContreProposer}
                    disabled={isSubmittingDemande || nouveauPrix <= 0}
                    className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg disabled:opacity-50 bg-purple-500"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {isSubmittingDemande ? 'Envoi...' : 'Envoyer'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL REFUS                                                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRefusModal && selectedDemande && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRefusModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 30 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-white rounded-3xl shadow-2xl z-[111] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5" strokeWidth={2.5} />
                    Refuser la demande
                  </h2>
                  <p className="text-white/80 text-sm mt-1">Indique pourquoi tu refuses</p>
                </div>
                <button
                  onClick={() => setShowRefusModal(false)}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center hover:bg-white/40"
                >
                  <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Raisons rapides */}
                <div>
                  <label className="block font-black text-gray-900 text-sm mb-3">Raison du refus</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'Stock épuisé pour ce produit',
                      'Prix proposé trop bas',
                      'Quantité trop importante',
                      'Délai de livraison impossible',
                      'Produit non disponible en ce moment',
                    ].map(raison => (
                      <motion.button
                        key={raison}
                        onClick={() => setRaisonRefus(raison)}
                        className={`py-3 px-4 rounded-2xl text-left font-semibold text-sm border-2 transition-all ${
                          raisonRefus === raison
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        {raison}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={raisonRefus}
                  onChange={e => setRaisonRefus(e.target.value)}
                  placeholder="Ou écris ta raison ici..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none font-semibold text-sm text-gray-700 resize-none"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRefusModal(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <motion.button
                    onClick={handleRefuserDemande}
                    disabled={isSubmittingDemande || !raisonRefus.trim()}
                    className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg disabled:opacity-50 bg-red-500"
                    whileTap={{ scale: 0.97 }}
                  >
                    {isSubmittingDemande ? 'Envoi...' : 'Confirmer le refus'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
}
