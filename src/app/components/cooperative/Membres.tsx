import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  UserPlus,
  MapPin,
  Phone,
  Users,
  Clock,
  Mic,
  MicOff,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Package,
  ShieldAlert,
  ShieldCheck,
  Star,
  Award,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  UserX,
  RefreshCw,
  Volume2,
  Filter,
  Calendar,
  BarChart3,
  Truck,
  Banknote,
  Weight,
  Send,
  Plus,
  ArrowLeft,
  Info,
  Archive,
  Activity,
} from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { useApp } from '../../contexts/AppContext';
import { NotificationButton } from '../marchand/NotificationButton';
import { toast } from 'sonner';

// ─── Couleurs coopérative ────────────────────────────────────────────────────
const C = '#2072AF';
const C_LIGHT = '#EBF4FB';
const C_DARK = '#1E5A8E';

// ─── Données Régions CI complètes ────────────────────────────────────────────
const REGIONS_CI: Record<string, string[]> = {
  'Abidjan': ['Abobo', 'Adjamé', 'Attécoubé', 'Bingerville', 'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët', 'Treichville', 'Yopougon', 'Anyama', 'Songon'],
  'Agnéby-Tiassa': ['Agboville', 'Taabo', 'Sikensi', 'Tiassalé', 'Grand-Morié'],
  'Bafing': ['Touba', 'Koro', 'Ouaninou'],
  'Bagoué': ['Boundiali', 'Gbon', 'Kouto', 'Tengrela', 'Kasséré'],
  'Bélier': ['Didiévi', 'Djékanou', 'Toumodi', 'Tiébissou'],
  'Béré': ['Mankono', 'Kounahiri', 'Zuénoula'],
  'Bounkani': ['Bouna', 'Doropo', 'Nassian', 'Téhini', 'Sandégué'],
  'Cavally': ['Guiglo', 'Bloléquin', 'Taï', 'Zagné'],
  'Folon': ['Minignan', 'Kaniasso', 'Madinani'],
  'Gbèkè': ['Bouaké', 'Béoumi', 'Botro', 'Sakassou', 'M\'Bahiakro'],
  'Gbôklé': ['Sassandra', 'Fresco', 'Guitry'],
  'Gôh': ['Gagnoa', 'Oumé', 'Ouragahio'],
  'Grands-Ponts': ['Dabou', 'Grand-Lahou', 'Jacqueville', 'Toupah'],
  'Guémon': ['Bangolo', 'Kouibly', 'Méagui', 'Facobly'],
  'Hambol': ['Katiola', 'Niakaramandougou', 'Dabakala', 'Fronan'],
  'Haut-Sassandra': ['Daloa', 'Issia', 'Vavoua', 'Zoukougbeu'],
  'Iffou': ['Daoukro', 'M\'Bahiakro', 'Prikro', 'Kouassi-Datékro'],
  'Indénié-Djuablin': ['Abengourou', 'Agnibilékrou', 'Anoumaba', 'Zaranou'],
  'Kabadougou': ['Odienné', 'Gbéléban', 'Samatiguila', 'Séguélon'],
  'La Mé': ['Alépé', 'Yakassé-Attobrou', 'Bonoua'],
  'Lôh-Djiboua': ['Lakota', 'Guitry', 'Divo', 'Hiré'],
  'Marahoué': ['Bouaflé', 'Sinfra', 'Zuenoula', 'Bonon'],
  'Moronou': ['Bongouanou', 'M\'Batto', 'Arrah'],
  'Nawa': ['Soubré', 'Buyo', 'Méagui', 'Grand-Zattry'],
  'N\'Zi': ['Dimbokro', 'Bocanda', 'Kouassi-Kouassikro'],
  'Poro': ['Korhogo', 'Dikodougou', 'Sinématiali', 'M\'Bengué', 'Napiéolédougou'],
  'San-Pédro': ['San-Pédro', 'Tabou', 'Grabo', 'Grand-Béréby'],
  'Sud-Comoé': ['Aboisso', 'Grand-Bassam', 'Adiaké', 'Ayamé'],
  'Tchologo': ['Ferkessédougou', 'Ouangolo', 'Kong', 'Niellé'],
  'Tonkpi': ['Man', 'Biankouma', 'Danané', 'Zouan-Hounien', 'Sipilou'],
  'Worodougou': ['Séguéla', 'Kéably', 'Sifié', 'Massala'],
  'Yamoussoukro': ['Yamoussoukro', 'Attiégouakro', 'Didiévi', 'Kossou'],
  'Zanzan': ['Bondoukou', 'Tanda', 'Sandégué', 'Nassian', 'Koun-Fao'],
};

// ─── Types ───────────────────────────────────────────────────────────────────
type StatutMembre = 'actif' | 'suspendu' | 'en_attente' | 'exclu';
type PeriodType = 'mois' | 'annuel' | 'historique';
type TabType = 'actifs' | 'en_attente' | 'archives';
type DrawerTab = 'performances' | 'transactions' | 'infos';

interface Membre {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  region: string;
  commune: string;
  zone?: string;
  activite: string;
  statut: StatutMembre;
  scoreJulaba: number;
  nbTransactions: number;
  txLivraison: number;
  volumeFCFA: { mois: number; annuel: number; historique: number };
  volumeKg: { mois: number; annuel: number; historique: number };
  dateAdhesion: string;
  chefDeGroupe: boolean;
  motifSuspension?: string;
  dateAdhesionCooperative: string;
}

interface ProducteurJulaba {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  region: string;
  commune: string;
  activite: string;
  scoreJulaba: number;
  produits: string[];
}

// ─── Mock: membres ────────────────────────────────────────────────────────────
const mockMembres: Membre[] = [
  { id: '1', nom: 'Kouassi', prenom: 'Adjoua', telephone: '+225 07 01 23 45 67', region: 'Abidjan', commune: 'Abobo', zone: 'Zone A', activite: 'Agricultrice', statut: 'actif', scoreJulaba: 92, nbTransactions: 128, txLivraison: 97, volumeFCFA: { mois: 1450000, annuel: 14200000, historique: 32100000 }, volumeKg: { mois: 2200, annuel: 21000, historique: 48000 }, dateAdhesion: '2024-03-15', chefDeGroupe: true, dateAdhesionCooperative: '2024-03-15' },
  { id: '2', nom: 'Traoré', prenom: 'Mamadou', telephone: '+225 05 34 56 78 90', region: 'Gbèkè', commune: 'Bouaké', zone: 'Zone Nord', activite: 'Producteur de riz', statut: 'actif', scoreJulaba: 85, nbTransactions: 94, txLivraison: 92, volumeFCFA: { mois: 980000, annuel: 9600000, historique: 21000000 }, volumeKg: { mois: 1800, annuel: 17000, historique: 38000 }, dateAdhesion: '2024-05-20', chefDeGroupe: false, dateAdhesionCooperative: '2024-05-20' },
  { id: '3', nom: 'Bamba', prenom: 'Fatoumata', telephone: '+225 01 45 67 89 12', region: 'Poro', commune: 'Korhogo', activite: 'Maraîchère', statut: 'actif', scoreJulaba: 78, nbTransactions: 67, txLivraison: 88, volumeFCFA: { mois: 720000, annuel: 7100000, historique: 15400000 }, volumeKg: { mois: 1200, annuel: 11500, historique: 26000 }, dateAdhesion: '2024-07-10', chefDeGroupe: false, dateAdhesionCooperative: '2024-07-10' },
  { id: '4', nom: 'Kone', prenom: 'Ibrahim', telephone: '+225 07 56 78 90 12', region: 'Hambol', commune: 'Katiola', activite: 'Éleveur', statut: 'actif', scoreJulaba: 71, nbTransactions: 55, txLivraison: 85, volumeFCFA: { mois: 560000, annuel: 5400000, historique: 12100000 }, volumeKg: { mois: 950, annuel: 9200, historique: 20500 }, dateAdhesion: '2024-09-01', chefDeGroupe: false, dateAdhesionCooperative: '2024-09-01' },
  { id: '5', nom: 'Diabaté', prenom: 'Salimata', telephone: '+225 05 67 89 01 23', region: 'Haut-Sassandra', commune: 'Daloa', activite: 'Productrice de cacao', statut: 'actif', scoreJulaba: 65, nbTransactions: 42, txLivraison: 80, volumeFCFA: { mois: 440000, annuel: 4300000, historique: 9800000 }, volumeKg: { mois: 780, annuel: 7600, historique: 17000 }, dateAdhesion: '2024-10-15', chefDeGroupe: false, dateAdhesionCooperative: '2024-10-15' },
  { id: '6', nom: 'Coulibaly', prenom: 'Arouna', telephone: '+225 07 78 90 12 34', region: 'Worodougou', commune: 'Séguéla', activite: 'Agriculteur', statut: 'actif', scoreJulaba: 58, nbTransactions: 38, txLivraison: 76, volumeFCFA: { mois: 380000, annuel: 3700000, historique: 8200000 }, volumeKg: { mois: 640, annuel: 6200, historique: 14000 }, dateAdhesion: '2024-11-05', chefDeGroupe: false, dateAdhesionCooperative: '2024-11-05' },
  { id: '7', nom: 'Yao', prenom: 'Kouakou', telephone: '+225 01 89 01 23 45', region: 'Bélier', commune: 'Toumodi', activite: 'Producteur d\'ignames', statut: 'actif', scoreJulaba: 48, nbTransactions: 29, txLivraison: 70, volumeFCFA: { mois: 290000, annuel: 2800000, historique: 6100000 }, volumeKg: { mois: 480, annuel: 4600, historique: 10200 }, dateAdhesion: '2024-12-20', chefDeGroupe: false, dateAdhesionCooperative: '2024-12-20' },
  { id: '8', nom: 'Ouattara', prenom: 'Mariam', telephone: '+225 07 90 12 34 56', region: 'Bagoué', commune: 'Boundiali', activite: 'Productrice de mangues', statut: 'actif', scoreJulaba: 38, nbTransactions: 18, txLivraison: 62, volumeFCFA: { mois: 180000, annuel: 1700000, historique: 3800000 }, volumeKg: { mois: 300, annuel: 2900, historique: 6400 }, dateAdhesion: '2025-01-10', chefDeGroupe: false, dateAdhesionCooperative: '2025-01-10' },
  { id: '9', nom: 'Koffi', prenom: 'Aya', telephone: '+225 05 01 23 45 67', region: 'Abidjan', commune: 'Cocody', activite: 'Commercante', statut: 'suspendu', scoreJulaba: 42, nbTransactions: 22, txLivraison: 55, volumeFCFA: { mois: 0, annuel: 2100000, historique: 4900000 }, volumeKg: { mois: 0, annuel: 3200, historique: 7200 }, dateAdhesion: '2024-06-01', chefDeGroupe: false, motifSuspension: 'Non-respect des délais de livraison répété (3 fois)', dateAdhesionCooperative: '2024-06-01' },
  { id: '10', nom: 'N\'Guessan', prenom: 'Kofi', telephone: '+225 07 12 34 56 78', region: 'N\'Zi', commune: 'Dimbokro', activite: 'Agriculteur', statut: 'suspendu', scoreJulaba: 31, nbTransactions: 14, txLivraison: 48, volumeFCFA: { mois: 0, annuel: 1400000, historique: 3100000 }, volumeKg: { mois: 0, annuel: 2100, historique: 4700 }, dateAdhesion: '2024-08-15', chefDeGroupe: false, motifSuspension: 'Litige financier en cours avec la coopérative', dateAdhesionCooperative: '2024-08-15' },
  { id: '11', nom: 'Touré', prenom: 'Aïssata', telephone: '+225 05 23 45 67 89', region: 'Tonkpi', commune: 'Man', activite: 'Productrice de café', statut: 'en_attente', scoreJulaba: 74, nbTransactions: 0, txLivraison: 0, volumeFCFA: { mois: 0, annuel: 0, historique: 0 }, volumeKg: { mois: 0, annuel: 0, historique: 0 }, dateAdhesion: '2026-02-28', chefDeGroupe: false, dateAdhesionCooperative: '2026-02-28' },
  { id: '12', nom: 'Soro', prenom: 'Lacina', telephone: '+225 01 34 56 78 90', region: 'Tchologo', commune: 'Ferkessédougou', activite: 'Producteur de coton', statut: 'en_attente', scoreJulaba: 68, nbTransactions: 0, txLivraison: 0, volumeFCFA: { mois: 0, annuel: 0, historique: 0 }, volumeKg: { mois: 0, annuel: 0, historique: 0 }, dateAdhesion: '2026-03-01', chefDeGroupe: false, dateAdhesionCooperative: '2026-03-01' },
  { id: '13', nom: 'Bakayoko', prenom: 'Dramane', telephone: '+225 07 45 67 89 01', region: 'Marahoué', commune: 'Bouaflé', activite: 'Agriculteur', statut: 'exclu', scoreJulaba: 12, nbTransactions: 5, txLivraison: 20, volumeFCFA: { mois: 0, annuel: 0, historique: 820000 }, volumeKg: { mois: 0, annuel: 0, historique: 1200 }, dateAdhesion: '2024-04-10', chefDeGroupe: false, motifSuspension: 'Fraude documentaire avérée', dateAdhesionCooperative: '2024-04-10' },
  { id: '14', nom: 'Loba', prenom: 'Adjoua', telephone: '+225 05 56 78 90 12', region: 'Gôh', commune: 'Gagnoa', activite: 'Maraîchère', statut: 'actif', scoreJulaba: 88, nbTransactions: 112, txLivraison: 94, volumeFCFA: { mois: 1120000, annuel: 10900000, historique: 24500000 }, volumeKg: { mois: 1980, annuel: 19200, historique: 43000 }, dateAdhesion: '2024-04-02', chefDeGroupe: true, dateAdhesionCooperative: '2024-04-02' },
  { id: '15', nom: 'Zoro', prenom: 'Jean-Baptiste', telephone: '+225 01 67 89 01 23', region: 'Cavally', commune: 'Guiglo', activite: 'Forestier', statut: 'actif', scoreJulaba: 61, nbTransactions: 44, txLivraison: 78, volumeFCFA: { mois: 410000, annuel: 3900000, historique: 8700000 }, volumeKg: { mois: 690, annuel: 6600, historique: 14800 }, dateAdhesion: '2025-01-25', chefDeGroupe: false, dateAdhesionCooperative: '2025-01-25' },
];

// ─── Mock: producteurs déjà identifiés Jùlaba ────────────────────────────────
const mockProducteursJulaba: ProducteurJulaba[] = [
  { id: 'p1', nom: 'Atta', prenom: 'Amenan', telephone: '+225 07 11 22 33 44', region: 'Yamoussoukro', commune: 'Kossou', activite: 'Productrice de riz', scoreJulaba: 81, produits: ['Riz', 'Maïs'] },
  { id: 'p2', nom: 'Dié', prenom: 'Clémentine', telephone: '+225 05 22 33 44 55', region: 'Gbèkè', commune: 'Sakassou', activite: 'Maraîchère', scoreJulaba: 73, produits: ['Tomates', 'Piments'] },
  { id: 'p3', nom: 'Gnagne', prenom: 'Sébastien', telephone: '+225 01 33 44 55 66', region: 'Nawa', commune: 'Soubré', activite: 'Cacaoyer', scoreJulaba: 67, produits: ['Cacao', 'Banane'] },
  { id: 'p4', nom: 'Fofana', prenom: 'Habibatou', telephone: '+225 07 44 55 66 77', region: 'Poro', commune: 'Sinématiali', activite: 'Agricultrice', scoreJulaba: 55, produits: ['Ignames', 'Manioc'] },
  { id: 'p5', nom: 'Brou', prenom: 'Konan', telephone: '+225 05 55 66 77 88', region: 'Iffou', commune: 'Daoukro', activite: 'Producteur', scoreJulaba: 89, produits: ['Café', 'Cacao'] },
];

// ─── Composant Score Jùlaba ───────────────────────────────────────────────────
function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 71 ? '#16A34A' : score >= 41 ? '#EA580C' : '#DC2626';
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Badge statut ─────────────────────────────────────────────────────────────
function BadgeStatut({ statut }: { statut: StatutMembre }) {
  const cfg: Record<StatutMembre, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
    actif: { label: 'Actif', bg: 'bg-green-100', text: 'text-green-700', Icon: CheckCircle },
    suspendu: { label: 'Suspendu', bg: 'bg-red-100', text: 'text-red-700', Icon: ShieldAlert },
    en_attente: { label: 'En attente', bg: 'bg-orange-100', text: 'text-orange-700', Icon: Clock },
    exclu: { label: 'Exclu', bg: 'bg-gray-200', text: 'text-gray-600', Icon: Archive },
  };
  const { label, bg, text, Icon } = cfg[statut];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function Membres() {
  const { speak, setIsModalOpen } = useApp();

  // ── États généraux ───────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabType>('actifs');
  const [periode, setPeriode] = useState<PeriodType>('mois');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterCommune, setFilterCommune] = useState('');
  const [filterPerf, setFilterPerf] = useState<'all' | 'haut' | 'moyen' | 'bas'>('all');
  const [filterStatut, setFilterStatut] = useState<'all' | 'actif' | 'suspendu'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // ── États modals / drawers ───────────────────────────────────────────────
  const [selectedMembre, setSelectedMembre] = useState<Membre | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('performances');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedProducteur, setSelectedProducteur] = useState<ProducteurJulaba | null>(null);
  const [addProduits, setAddProduits] = useState<string[]>([]);
  const [addVolumeKg, setAddVolumeKg] = useState('');
  const [addPrix, setAddPrix] = useState('');
  // Filtres modal ajout producteur
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [addFilterActivite, setAddFilterActivite] = useState('');
  const [addFilterRegion, setAddFilterRegion] = useState('');

  // ── États actions ────────────────────────────────────────────────────────
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [motifSuspension, setMotifSuspension] = useState('');
  const [motifExclusion, setMotifExclusion] = useState('');
  const [membres, setMembres] = useState<Membre[]>(mockMembres);

  // ── Synchronisation Bottom Bar ──────────────────────────────────────────
  useEffect(() => {
    const anyModalOpen =
      selectedMembre !== null ||
      showAddModal ||
      showSuspendModal ||
      showExcludeModal ||
      showPromoteModal;
    setIsModalOpen(anyModalOpen);
  }, [selectedMembre, showAddModal, showSuspendModal, showExcludeModal,
      showPromoteModal, setIsModalOpen]);

  // Nettoyage à la destruction du composant
  useEffect(() => () => { setIsModalOpen(false); }, [setIsModalOpen]);

  // ─── Communes dynamiques selon région ───────────────────────────────────
  const communesDisponibles = useMemo(
    () => (filterRegion ? REGIONS_CI[filterRegion] || [] : []),
    [filterRegion]
  );

  // ─── Filtrage + pagination ───────────────────────────────────────────────
  const membresFiltres = useMemo(() => {
    return membres.filter((m) => {
      // Tab
      if (tab === 'actifs' && (m.statut === 'en_attente' || m.statut === 'exclu')) return false;
      if (tab === 'en_attente' && m.statut !== 'en_attente') return false;
      if (tab === 'archives' && m.statut !== 'exclu') return false;

      // Recherche
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!`${m.prenom} ${m.nom}`.toLowerCase().includes(q) &&
            !m.telephone.includes(q) && !m.commune.toLowerCase().includes(q)) return false;
      }

      // Région
      if (filterRegion && m.region !== filterRegion) return false;
      if (filterCommune && m.commune !== filterCommune) return false;

      // Performance
      if (filterPerf === 'haut' && m.scoreJulaba < 71) return false;
      if (filterPerf === 'moyen' && (m.scoreJulaba < 41 || m.scoreJulaba > 70)) return false;
      if (filterPerf === 'bas' && m.scoreJulaba > 40) return false;

      // Statut (uniquement sur tab actifs)
      if (tab === 'actifs' && filterStatut !== 'all' && m.statut !== filterStatut) return false;

      return true;
    });
  }, [membres, tab, searchQuery, filterRegion, filterCommune, filterPerf, filterStatut]);

  const totalPages = Math.max(1, Math.ceil(membresFiltres.length / PAGE_SIZE));
  const membresPagines = membresFiltres.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ─── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const actifs = membres.filter(m => m.statut === 'actif');
    const vKey = periode;
    return {
      total: membres.filter(m => m.statut !== 'exclu').length,
      actifs: actifs.length,
      suspendus: membres.filter(m => m.statut === 'suspendu').length,
      enAttente: membres.filter(m => m.statut === 'en_attente').length,
      volumeFCFA: actifs.reduce((s, m) => s + m.volumeFCFA[vKey], 0),
      volumeKg: actifs.reduce((s, m) => s + m.volumeKg[vKey], 0),
    };
  }, [membres, periode]);

  // ─── Reconnaissance vocale ───────────────────────────────────────────────
  const startVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('La reconnaissance vocale n\'est pas disponible sur ce navigateur');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setSearchQuery(t);
      speak(`Recherche pour ${t}`);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  }, [speak]);

  const voiceLecture = () => {
    const msg = `Vous avez ${kpis.actifs} membres actifs, ${kpis.suspendus} suspendus, et ${kpis.enAttente} en attente de confirmation. Le volume total ce ${periode === 'mois' ? 'mois' : periode === 'annuel' ? 'an' : 'historique'} est de ${(kpis.volumeFCFA / 1000000).toFixed(1)} millions de francs CFA.`;
    speak(msg);
    toast.info('Tantie Sagesse parle...');
  };

  // ─── Actions membres ─────────────────────────────────────────────────────
  const doSuspend = () => {
    if (!motifSuspension.trim()) {
      toast.error('Le motif de suspension est obligatoire');
      return;
    }
    setMembres(prev => prev.map(m =>
      m.id === selectedMembre?.id ? { ...m, statut: 'suspendu' as StatutMembre, motifSuspension } : m
    ));
    toast.success(`${selectedMembre?.prenom} ${selectedMembre?.nom} suspendu(e). Notification envoyée.`);
    speak(`${selectedMembre?.prenom} ${selectedMembre?.nom} a été suspendu. Une notification a été envoyée.`);
    setShowSuspendModal(false);
    setMotifSuspension('');
    setSelectedMembre(null);
  };

  const doReactivate = (m: Membre) => {
    setMembres(prev => prev.map(mb => mb.id === m.id ? { ...mb, statut: 'actif' as StatutMembre, motifSuspension: undefined } : mb));
    toast.success(`${m.prenom} ${m.nom} réactivé(e). Notification envoyée.`);
    speak(`${m.prenom} ${m.nom} a été réactivé`);
    setSelectedMembre(null);
  };

  const doExclude = () => {
    if (!motifExclusion.trim()) {
      toast.error('Le motif d\'exclusion est obligatoire');
      return;
    }
    setMembres(prev => prev.map(m =>
      m.id === selectedMembre?.id ? { ...m, statut: 'exclu' as StatutMembre, motifSuspension: motifExclusion } : m
    ));
    toast.success(`${selectedMembre?.prenom} ${selectedMembre?.nom} exclu(e) définitivement.`);
    speak(`${selectedMembre?.prenom} a été exclu définitivement de la coopérative`);
    setShowExcludeModal(false);
    setMotifExclusion('');
    setSelectedMembre(null);
  };

  const doPromote = (m: Membre) => {
    setMembres(prev => prev.map(mb => mb.id === m.id ? { ...mb, chefDeGroupe: !mb.chefDeGroupe } : mb));
    const action = m.chefDeGroupe ? 'retiré de' : 'promu chef de';
    toast.success(`${m.prenom} ${m.nom} ${action} groupe`);
    setShowPromoteModal(false);
    setSelectedMembre(null);
  };

  const doAcceptMembre = (m: Membre) => {
    setMembres(prev => prev.map(mb => mb.id === m.id ? { ...mb, statut: 'actif' as StatutMembre } : mb));
    toast.success(`${m.prenom} ${m.nom} accepté(e) dans la coopérative`);
    speak(`${m.prenom} ${m.nom} a rejoint la coopérative`);
  };

  const doRefuserMembre = (m: Membre) => {
    setMembres(prev => prev.filter(mb => mb.id !== m.id));
    toast.info(`Demande de ${m.prenom} ${m.nom} refusée`);
    speak(`La demande de ${m.prenom} ${m.nom} a été refusée`);
  };

  const doAddProducteur = () => {
    if (!selectedProducteur) return;
    const nouveau: Membre = {
      id: `new_${Date.now()}`,
      nom: selectedProducteur.nom,
      prenom: selectedProducteur.prenom,
      telephone: selectedProducteur.telephone,
      region: selectedProducteur.region,
      commune: selectedProducteur.commune,
      activite: selectedProducteur.activite,
      statut: 'en_attente',
      scoreJulaba: selectedProducteur.scoreJulaba,
      nbTransactions: 0,
      txLivraison: 0,
      volumeFCFA: { mois: 0, annuel: 0, historique: 0 },
      volumeKg: { mois: 0, annuel: 0, historique: 0 },
      dateAdhesion: new Date().toISOString().split('T')[0],
      chefDeGroupe: false,
      dateAdhesionCooperative: new Date().toISOString().split('T')[0],
    };
    setMembres(prev => [nouveau, ...prev]);
    toast.success(`Invitation envoyée à ${selectedProducteur.prenom} ${selectedProducteur.nom}`);
    speak(`Une invitation a été envoyée à ${selectedProducteur.prenom} ${selectedProducteur.nom}. En attente de sa confirmation.`);
    setShowAddModal(false);
    setAddStep(1);
    setSelectedProducteur(null);
    setAddProduits([]);
    setAddVolumeKg('');
    setAddPrix('');
    setAddSearchQuery('');
    setAddFilterActivite('');
    setAddFilterRegion('');
  };

  // ─── Render carte membre — Style Identificateur ──────────────────────────
  const renderCarte = (m: Membre, index: number) => {
    const scoreColor = m.scoreJulaba >= 71 ? '#16A34A' : m.scoreJulaba >= 41 ? '#EA580C' : '#DC2626';
    const initiales = `${m.prenom[0]}${m.nom[0]}`.toUpperCase();
    const borderColor = m.statut === 'suspendu' ? '#FECACA' : m.statut === 'en_attente' ? '#FED7AA' : '#DBEAFE';

    return (
      <motion.div
        key={m.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.03 }}
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: `2px solid ${borderColor}` }}
      >
        <motion.div
          className="p-4"
          onClick={() => { setSelectedMembre(m); setDrawerTab('performances'); }}
          whileHover={{ backgroundColor: '#FAFAFA' }}
        >
          <div className="flex items-start gap-3">
            {/* Avatar — style Identificateur */}
            <div className="relative flex-shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
              >
                {initiales}
              </div>
              {m.chefDeGroupe && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>

            {/* Infos principales */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {m.prenom} {m.nom}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${C}15`, color: C }}
                >
                  {m.activite}
                </div>
                <BadgeStatut statut={m.statut} />
              </div>
              <div className="space-y-1 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{m.telephone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{m.commune} — {m.region}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Adhésion le {new Date(m.dateAdhesionCooperative).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Score Jùlaba */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center border-2 font-bold text-sm"
                style={{ borderColor: scoreColor, color: scoreColor, backgroundColor: `${scoreColor}12` }}
              >
                {m.scoreJulaba}
              </div>
              <p className="text-[9px] text-gray-400 font-bold">score</p>
            </div>
          </div>
        </motion.div>

        {/* Boutons Accepter/Refuser pour en attente */}
        {m.statut === 'en_attente' && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2 border-t-2 border-orange-100 pt-3">
            <motion.button
              onClick={(e) => { e.stopPropagation(); doAcceptMembre(m); }}
              className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-green-600 text-white font-bold text-sm"
              whileTap={{ scale: 0.96 }}
            >
              <CheckCircle className="w-4 h-4" /> Accepter
            </motion.button>
            <motion.button
              onClick={(e) => { e.stopPropagation(); doRefuserMembre(m); }}
              className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
              whileTap={{ scale: 0.96 }}
            >
              <XCircle className="w-4 h-4" /> Refuser
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  };

  // ─── Drawer détail membre ──────────���─────────────────────────────────────
  const renderDrawer = () => {
    if (!selectedMembre) return null;
    const m = selectedMembre;
    const vol = m.volumeFCFA[periode];
    const kg = m.volumeKg[periode];
    const initiales = `${m.prenom[0]}${m.nom[0]}`.toUpperCase();
    const perfColor = m.scoreJulaba >= 71 ? '#16A34A' : m.scoreJulaba >= 41 ? '#EA580C' : '#DC2626';

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelectedMembre(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full max-h-[92vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>

            {/* Header drawer */}
            <div className="px-5 pb-4 border-b border-gray-100 flex items-center gap-4">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-white border-2"
                  style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})`, borderColor: C }}
                >
                  {initiales}
                </div>
                {m.chefDeGroupe && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-lg">{m.prenom} {m.nom}</h2>
                <p className="text-sm text-gray-500 truncate">{m.activite} — {m.commune}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <BadgeStatut statut={m.statut} />
                  {m.chefDeGroupe && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                      <Crown className="w-2.5 h-2.5" /> Chef de groupe
                    </span>
                  )}
                </div>
              </div>
              <motion.button
                onClick={() => setSelectedMembre(null)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Tabs drawer */}
            <div className="flex border-b border-gray-100 bg-gray-50">
              {([
                { id: 'performances', label: 'Performances', Icon: Activity },
                { id: 'transactions', label: 'Transactions', Icon: BarChart3 },
                { id: 'infos', label: 'Infos', Icon: Info },
              ] as const).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setDrawerTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all ${
                    drawerTab === id ? `border-[${C}] text-[${C}]` : 'border-transparent text-gray-500'
                  }`}
                  style={drawerTab === id ? { borderBottomColor: C, color: C } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Contenu tabs */}
            <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-4">
              {drawerTab === 'performances' && (
                <>
                  {/* Score central */}
                  <div className="flex items-center justify-center gap-6 bg-gradient-to-br from-blue-50 to-white rounded-3xl border-2 border-blue-100 p-5">
                    <ScoreRing score={m.scoreJulaba} size={80} />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Score Jùlaba</p>
                      <p className="text-4xl font-bold" style={{ color: perfColor }}>{m.scoreJulaba}<span className="text-base text-gray-400">/100</span></p>
                      <p className="text-xs mt-1 font-semibold" style={{ color: perfColor }}>
                        {m.scoreJulaba >= 71 ? 'Excellente performance' : m.scoreJulaba >= 41 ? 'Performance moyenne' : 'Performance faible'}
                      </p>
                    </div>
                  </div>

                  {/* Indicateurs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-4 text-center">
                      <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
                      <p className="text-2xl font-bold text-gray-900">{m.nbTransactions}</p>
                      <p className="text-xs text-gray-500">Transactions totales</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl border-2 border-green-100 p-4 text-center">
                      <Truck className="w-6 h-6 text-green-600 mx-auto mb-1.5" />
                      <p className="text-2xl font-bold text-gray-900">{m.txLivraison}%</p>
                      <p className="text-xs text-gray-500">Taux de livraison</p>
                    </div>
                  </div>

                  {/* Volume par période */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Volume contribué — {periode === 'mois' ? 'Mois en cours' : periode === 'annuel' ? 'Cumul annuel' : 'Tout l\'historique'}</p>
                    <div className="flex items-center gap-3">
                      <Banknote className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Volume FCFA</p>
                        <p className="font-bold text-green-700">{vol.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Weight className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Volume en kg</p>
                        <p className="font-bold text-amber-700">{kg.toLocaleString('fr-FR')} kg ({(kg / 1000).toFixed(2)} T)</p>
                      </div>
                    </div>
                  </div>

                  {/* Barre de taux de livraison */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-gray-600">Taux de livraison</p>
                      <span className="text-xs font-bold" style={{ color: perfColor }}>{m.txLivraison}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: perfColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${m.txLivraison}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Motif suspension si suspendu */}
                  {m.statut === 'suspendu' && m.motifSuspension && (
                    <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <p className="text-xs font-bold text-red-700">Motif de suspension</p>
                      </div>
                      <p className="text-sm text-red-800">{m.motifSuspension}</p>
                    </div>
                  )}
                </>
              )}

              {drawerTab === 'transactions' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Historique simulé des dernières transactions</p>
                  {m.nbTransactions === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune transaction pour ce membre</p>
                    </div>
                  ) : (
                    Array.from({ length: Math.min(6, m.nbTransactions) }).map((_, i) => {
                      const montant = Math.floor(Math.random() * 300000 + 50000);
                      const kg = Math.floor(Math.random() * 500 + 50);
                      const date = new Date(2026, 2 - i, 3 - i * 3);
                      const statuts = ['Livré', 'Livré', 'Livré', 'En cours', 'Livré', 'Annulé'];
                      const s = statuts[i];
                      return (
                        <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${s === 'Livré' ? 'bg-green-100' : s === 'En cours' ? 'bg-blue-100' : 'bg-red-100'}`}>
                            {s === 'Livré' ? <CheckCircle className={`w-4 h-4 text-green-600`} /> : s === 'En cours' ? <Clock className="w-4 h-4 text-blue-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className="text-xs font-bold text-gray-900">{montant.toLocaleString('fr-FR')} FCFA</p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s === 'Livré' ? 'bg-green-100 text-green-700' : s === 'En cours' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{s}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">{kg} kg — {date.toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {drawerTab === 'infos' && (
                <div className="space-y-3">
                  {[
                    { Icon: Phone, label: 'Téléphone', value: m.telephone },
                    { Icon: MapPin, label: 'Commune', value: `${m.commune}, ${m.region}` },
                    { Icon: Package, label: 'Activité', value: m.activite },
                    { Icon: Calendar, label: 'Adhésion coopérative', value: new Date(m.dateAdhesionCooperative).toLocaleDateString('fr-FR') },
                    { Icon: Star, label: 'Score Jùlaba', value: `${m.scoreJulaba}/100` },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-100 p-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: C_LIGHT }}>
                        <Icon className="w-4 h-4" style={{ color: C }} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">{label}</p>
                        <p className="text-sm font-bold text-gray-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions en bas du drawer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white space-y-2">
              {m.statut === 'actif' && (
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => { setShowSuspendModal(true); }}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-red-50 text-red-700 border-2 border-red-200 text-sm font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ShieldAlert className="w-4 h-4" /> Suspendre
                  </motion.button>
                  <motion.button
                    onClick={() => setShowPromoteModal(true)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-amber-50 text-amber-700 border-2 border-amber-200 text-sm font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Crown className="w-4 h-4" /> {m.chefDeGroupe ? 'Retirer chef' : 'Promouvoir'}
                  </motion.button>
                </div>
              )}
              {m.statut === 'suspendu' && (
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => doReactivate(m)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-green-50 text-green-700 border-2 border-green-200 text-sm font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <RefreshCw className="w-4 h-4" /> Réactiver
                  </motion.button>
                  <motion.button
                    onClick={() => setShowExcludeModal(true)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gray-100 text-gray-700 border-2 border-gray-200 text-sm font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <UserX className="w-4 h-4" /> Exclure
                  </motion.button>
                </div>
              )}
              {m.statut === 'en_attente' && (
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => doAcceptMembre(m)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-green-600 text-white text-sm font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CheckCircle className="w-4 h-4" /> Accepter
                  </motion.button>
                  <motion.button
                    onClick={() => doRefuserMembre(m)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gray-100 text-gray-700 text-sm font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <XCircle className="w-4 h-4" /> Refuser
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── Modal Ajouter membre ─────────────────────────────────────────────────
  const renderAddModal = () => (
    <AnimatePresence>
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={() => { setShowAddModal(false); setAddSearchQuery(''); setAddFilterActivite(''); setAddFilterRegion(''); }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="px-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Ajouter un producteur</h2>
                <p className="text-xs text-gray-500">Étape {addStep} sur 3</p>
              </div>
              <motion.button
                onClick={() => { setShowAddModal(false); setAddStep(1); setSelectedProducteur(null); setAddSearchQuery(''); setAddFilterActivite(''); setAddFilterRegion(''); }}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                whileHover={{ rotate: 90 }}
              >
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Barre progression */}
            <div className="px-5 pt-3">
              <div className="flex gap-1.5">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: C }}
                      animate={{ width: s <= addStep ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['Sélection', 'Configuration', 'Envoi'].map((l, i) => (
                  <span key={l} className={`text-[10px] font-semibold ${i + 1 <= addStep ? 'text-blue-600' : 'text-gray-400'}`}>{l}</span>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Étape 1: Sélection producteur */}
              {addStep === 1 && (
                <>
                  <p className="text-sm text-gray-600">Sélectionnez un producteur déjà identifié sur Jùlaba :</p>

                  {/* Barre de recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, activité..."
                      value={addSearchQuery}
                      onChange={(e) => setAddSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:outline-none bg-white placeholder:text-gray-400"
                      style={{ borderColor: addSearchQuery ? C : undefined }}
                    />
                  </div>

                  {/* Filtres rapides */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Activité</label>
                      <select
                        value={addFilterActivite}
                        onChange={(e) => setAddFilterActivite(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-xs focus:outline-none bg-white"
                        style={{ borderColor: addFilterActivite ? C : undefined }}
                      >
                        <option value="">Toutes les activités</option>
                        {[...new Set(mockProducteursJulaba.map(p => p.activite))].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Région</label>
                      <select
                        value={addFilterRegion}
                        onChange={(e) => setAddFilterRegion(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-xs focus:outline-none bg-white"
                        style={{ borderColor: addFilterRegion ? C : undefined }}
                      >
                        <option value="">Toutes les régions</option>
                        {[...new Set(mockProducteursJulaba.map(p => p.region))].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Résumé du filtre */}
                  {(addSearchQuery || addFilterActivite || addFilterRegion) && (
                    <div className="flex items-center justify-between px-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-bold text-gray-900">
                          {mockProducteursJulaba.filter(p => {
                            const q = addSearchQuery.toLowerCase();
                            const matchSearch = !addSearchQuery || `${p.prenom} ${p.nom}`.toLowerCase().includes(q) || p.activite.toLowerCase().includes(q);
                            const matchActivite = !addFilterActivite || p.activite === addFilterActivite;
                            const matchRegion = !addFilterRegion || p.region === addFilterRegion;
                            return matchSearch && matchActivite && matchRegion;
                          }).length}
                        </span> résultat(s) trouvé(s)
                      </p>
                      <motion.button
                        onClick={() => { setAddSearchQuery(''); setAddFilterActivite(''); setAddFilterRegion(''); }}
                        className="text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ color: C, backgroundColor: C_LIGHT }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Effacer
                      </motion.button>
                    </div>
                  )}

                  {/* Liste filtrée */}
                  <div className="space-y-3">
                    {(() => {
                      const filtered = mockProducteursJulaba.filter(p => {
                        const q = addSearchQuery.toLowerCase();
                        const matchSearch = !addSearchQuery || `${p.prenom} ${p.nom}`.toLowerCase().includes(q) || p.activite.toLowerCase().includes(q) || p.commune.toLowerCase().includes(q);
                        const matchActivite = !addFilterActivite || p.activite === addFilterActivite;
                        const matchRegion = !addFilterRegion || p.region === addFilterRegion;
                        return matchSearch && matchActivite && matchRegion;
                      });

                      if (filtered.length === 0) return (
                        <div className="text-center py-10">
                          <Search className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                          <p className="text-sm text-gray-500 font-semibold">Aucun producteur trouvé</p>
                          <p className="text-xs text-gray-400 mt-1">Modifiez vos critères de recherche</p>
                        </div>
                      );

                      return filtered.map((p) => (
                      <motion.div
                        key={p.id}
                        onClick={() => setSelectedProducteur(p)}
                        className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                          selectedProducteur?.id === p.id ? `border-[${C}] bg-blue-50` : 'border-gray-200 bg-white'
                        }`}
                        style={selectedProducteur?.id === p.id ? { borderColor: C, backgroundColor: C_LIGHT } : {}}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
                          >
                            {p.prenom[0]}{p.nom[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm">{p.prenom} {p.nom}</h4>
                            <p className="text-xs text-gray-500 truncate">{p.activite} — {p.commune}, {p.region}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">Score {p.scoreJulaba}/100</span>
                              <span className="text-[10px] text-gray-500">{p.produits.join(', ')}</span>
                            </div>
                          </div>
                          {selectedProducteur?.id === p.id && (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: C }} />
                          )}
                        </div>
                      </motion.div>
                      ));
                    })()}
                  </div>
                </>
              )}

              {/* Étape 2: Configuration */}
              {addStep === 2 && selectedProducteur && (
                <>
                  <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">Producteur sélectionné</p>
                    <p className="font-bold text-gray-900">{selectedProducteur.prenom} {selectedProducteur.nom}</p>
                    <p className="text-xs text-gray-500">{selectedProducteur.activite}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Volume estimé mensuel (kg)</label>
                    <input
                      type="number"
                      placeholder="Ex: 500"
                      value={addVolumeKg}
                      onChange={(e) => setAddVolumeKg(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Prix négocié / kg (FCFA)</label>
                    <input
                      type="number"
                      placeholder="Ex: 650"
                      value={addPrix}
                      onChange={(e) => setAddPrix(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Produits concernés</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducteur.produits.map((prod) => (
                        <motion.button
                          key={prod}
                          onClick={() => setAddProduits(prev => prev.includes(prod) ? prev.filter(p => p !== prod) : [...prev, prod])}
                          className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                            addProduits.includes(prod) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          {prod}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Étape 3: Confirmation */}
              {addStep === 3 && selectedProducteur && (
                <>
                  <div className="text-center py-4">
                    <motion.div
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: C_LIGHT }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Send className="w-8 h-8" style={{ color: C }} />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Prêt à envoyer l'invitation</h3>
                    <p className="text-sm text-gray-500">Une notification sera envoyée à <span className="font-bold">{selectedProducteur.prenom} {selectedProducteur.nom}</span> pour accepter ou refuser de vendre à votre coopérative.</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Producteur</span>
                      <span className="font-bold text-gray-900">{selectedProducteur.prenom} {selectedProducteur.nom}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Région</span>
                      <span className="font-bold text-gray-900">{selectedProducteur.commune}, {selectedProducteur.region}</span>
                    </div>
                    {addVolumeKg && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Volume estimé</span>
                        <span className="font-bold text-gray-900">{addVolumeKg} kg/mois</span>
                      </div>
                    )}
                    {addPrix && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Prix négocié</span>
                        <span className="font-bold text-gray-900">{parseInt(addPrix).toLocaleString('fr-FR')} FCFA/kg</span>
                      </div>
                    )}
                    {addProduits.length > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Produits</span>
                        <span className="font-bold text-gray-900">{addProduits.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Le statut sera "En attente" jusqu'à la confirmation de l'admin Back-Office Jùlaba.</p>
                  </div>
                </>
              )}
            </div>

            {/* Boutons navigation modal */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              {addStep > 1 && (
                <motion.button
                  onClick={() => setAddStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
                </motion.button>
              )}
              <motion.button
                onClick={() => {
                  if (addStep < 3) {
                    if (addStep === 1 && !selectedProducteur) { toast.error('Sélectionnez un producteur'); return; }
                    setAddStep(s => s + 1);
                  } else {
                    doAddProducteur();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-white font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})` }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {addStep === 3 ? (
                  <><Send className="w-4 h-4" /> Envoyer l'invitation</>
                ) : (
                  <>Suivant <ChevronRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── Modal Suspendre ──────────────────────────────────────────────────────
  const renderSuspendModal = () => (
    <AnimatePresence>
      {showSuspendModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Suspendre le membre</h3>
                <p className="text-xs text-gray-500">{selectedMembre?.prenom} {selectedMembre?.nom}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">Les transactions de ce membre via la coopérative seront bloquées. Une notification sera envoyée.</p>
            </div>

            <label className="text-xs font-bold text-gray-700 block mb-2">
              Motif de suspension <span className="text-red-500">*</span>
            </label>
            <div className="mb-2">
              {['Non-respect des délais', 'Litige financier', 'Fraude documentaire', 'Comportement inapproprié'].map((m) => (
                <motion.button
                  key={m}
                  onClick={() => setMotifSuspension(m)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl mb-1 border ${motifSuspension === m ? 'border-red-400 bg-red-50 text-red-700 font-bold' : 'border-gray-200 text-gray-600'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  {m}
                </motion.button>
              ))}
            </div>
            <textarea
              placeholder="Ou précisez un motif personnalisé..."
              value={motifSuspension.includes('\n') || !['Non-respect des délais', 'Litige financier', 'Fraude documentaire', 'Comportement inapproprié'].includes(motifSuspension) ? motifSuspension : ''}
              onChange={(e) => setMotifSuspension(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border-2 border-gray-200 focus:border-red-400 focus:outline-none text-sm resize-none"
              rows={3}
            />

            <div className="flex gap-2 mt-4">
              <motion.button
                onClick={() => { setShowSuspendModal(false); setMotifSuspension(''); }}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
                whileTap={{ scale: 0.97 }}
              >
                Annuler
              </motion.button>
              <motion.button
                onClick={doSuspend}
                className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm"
                whileTap={{ scale: 0.97 }}
              >
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── Modal Exclure ────────────────────────────────────────────────────────
  const renderExcludeModal = () => (
    <AnimatePresence>
      {showExcludeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <UserX className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Exclusion définitive</h3>
                <p className="text-xs text-gray-500">{selectedMembre?.prenom} {selectedMembre?.nom}</p>
              </div>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-2xl p-3 mb-4">
              <p className="text-xs text-gray-700">Ce membre sera archivé et ne pourra plus effectuer de transactions avec la coopérative. Cette action est irréversible.</p>
            </div>

            <label className="text-xs font-bold text-gray-700 block mb-2">Motif d'exclusion <span className="text-red-500">*</span></label>
            <textarea
              placeholder="Motif obligatoire d'exclusion définitive..."
              value={motifExclusion}
              onChange={(e) => setMotifExclusion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none text-sm resize-none mb-4"
              rows={3}
            />

            <div className="flex gap-2">
              <motion.button
                onClick={() => { setShowExcludeModal(false); setMotifExclusion(''); }}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
                whileTap={{ scale: 0.97 }}
              >
                Annuler
              </motion.button>
              <motion.button
                onClick={doExclude}
                className="flex-1 py-3 rounded-2xl bg-gray-700 text-white font-bold text-sm"
                whileTap={{ scale: 0.97 }}
              >
                Exclure définitivement
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── Modal Promouvoir ─────────────────────────────────────────────────────
  const renderPromoteModal = () => (
    <AnimatePresence>
      {showPromoteModal && selectedMembre && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedMembre.chefDeGroupe ? 'Retirer le rôle de chef' : 'Promouvoir chef de groupe'}</h3>
                <p className="text-xs text-gray-500">{selectedMembre.prenom} {selectedMembre.nom}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              {selectedMembre.chefDeGroupe
                ? `${selectedMembre.prenom} perdra son badge "Chef de groupe".`
                : `${selectedMembre.prenom} recevra un badge "Chef de groupe" visible par tous les membres.`
              }
            </p>
            <div className="flex gap-2">
              <motion.button
                onClick={() => setShowPromoteModal(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm"
                whileTap={{ scale: 0.97 }}
              >
                Annuler
              </motion.button>
              <motion.button
                onClick={() => doPromote(selectedMembre)}
                className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm"
                whileTap={{ scale: 0.97 }}
              >
                {selectedMembre.chefDeGroupe ? 'Retirer' : 'Promouvoir'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── RENDU PRINCIPAL — Style Identificateur ──────────────────────────────
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
            <h1 className="flex-1 font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl">Membres</h1>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={voiceLecture}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                style={{ backgroundColor: C_LIGHT, borderColor: C }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Volume2 className="w-5 h-5" style={{ color: C }} />
              </motion.button>
              <NotificationButton />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu */}
      <div className="pt-24 pb-32 lg:pb-8 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-[#F5F0ED] to-white">

        {/* ── Switcher période ── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl p-1.5 border-2 border-gray-100 flex gap-1.5 shadow-sm">
            {([
              { id: 'mois', label: 'Mois en cours' },
              { id: 'annuel', label: 'Cumul annuel' },
              { id: 'historique', label: 'Historique' },
            ] as const).map(({ id, label }) => (
              <motion.button
                key={id}
                onClick={() => { setPeriode(id); setPage(1); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  periode === id ? 'text-white shadow-md' : 'text-gray-500 bg-transparent'
                }`}
                style={periode === id ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : {}}
                whileTap={{ scale: 0.97 }}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── KPIs 3 colonnes — style Identificateur ── */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* KPI Total actifs */}
          <motion.button
            onClick={() => { setTab('actifs'); setFilterStatut('actif'); setPage(1); }}
            className={`relative bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${tab === 'actifs' && filterStatut === 'actif' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-blue-200'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Total</p>
              <motion.div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: C_LIGHT }}
                animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
              ><Users className="w-5 h-5" style={{ color: C }} strokeWidth={2.5} /></motion.div>
            </div>
            <motion.p className="text-3xl font-bold" style={{ color: C }}
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
            >{kpis.actifs}</motion.p>
            {tab === 'actifs' && filterStatut === 'actif' && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full" style={{ backgroundColor: C }} />}
          </motion.button>

          {/* KPI En attente */}
          <motion.button
            onClick={() => { setTab('en_attente'); setPage(1); }}
            className={`relative bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${tab === 'en_attente' ? 'border-orange-500 ring-2 ring-orange-300' : 'border-orange-300'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">En attente</p>
              <motion.div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"
                animate={kpis.enAttente > 0 ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
              ><Clock className="w-5 h-5 text-orange-600" strokeWidth={2.5} /></motion.div>
            </div>
            <motion.p className="text-3xl font-bold text-orange-600"
              animate={kpis.enAttente > 0 ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
            >{kpis.enAttente}</motion.p>
            {tab === 'en_attente' && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />}
          </motion.button>

          {/* KPI Suspendus */}
          <motion.button
            onClick={() => { setTab('actifs'); setFilterStatut('suspendu'); setPage(1); }}
            className={`relative bg-gradient-to-br from-red-50 via-white to-red-50 rounded-3xl p-3 shadow-md overflow-hidden border-2 text-left cursor-pointer ${tab === 'actifs' && filterStatut === 'suspendu' ? 'border-red-500 ring-2 ring-red-300' : 'border-red-200'}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600 font-semibold">Suspendus</p>
              <motion.div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
                animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}
              ><ShieldAlert className="w-5 h-5 text-red-600" strokeWidth={2.5} /></motion.div>
            </div>
            <motion.p className="text-3xl font-bold text-red-600"
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
            >{kpis.suspendus}</motion.p>
            {tab === 'actifs' && filterStatut === 'suspendu' && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-500 rounded-full" />}
          </motion.button>
        </div>

        {/* Boutons d'actions — style Identificateur */}
        <motion.div className="grid grid-cols-2 gap-3 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.button
            onClick={() => speak('Liste des membres de la coopérative')}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#2072AF] transition-colors"
            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          >
            <Users className="w-5 h-5" style={{ color: C }} />
            <span className="font-semibold text-gray-700">Membres</span>
          </motion.button>
          <motion.button
            onClick={() => { setShowAddModal(true); speak('Ajouter un nouveau producteur partenaire'); }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-white border-2"
            style={{ background: `linear-gradient(135deg, ${C}, ${C_DARK})`, borderColor: C }}
            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Ajouter membre</span>
          </motion.button>
        </motion.div>

        {/* Tabs — style Identificateur */}
        <motion.div className="mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: 'actifs' as TabType, label: 'Actifs', count: membres.filter(m => m.statut === 'actif' || m.statut === 'suspendu').length, activeClass: 'from-[#2072AF] to-[#1E5A8E]' },
                { id: 'en_attente' as TabType, label: 'En attente', count: kpis.enAttente, activeClass: 'from-orange-500 to-orange-600' },
                { id: 'archives' as TabType, label: 'Archivés', count: membres.filter(m => m.statut === 'exclu').length, activeClass: 'from-gray-500 to-gray-700' },
              ]).map(({ id, label, count, activeClass }) => (
                <motion.button
                  key={id}
                  onClick={() => { setTab(id); setFilterStatut('all'); setPage(1); }}
                  className={`relative flex items-center justify-center gap-1.5 px-3 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${tab === id ? `bg-gradient-to-r ${activeClass} text-white shadow-md` : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === id ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche + filtres */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative mb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher par nom, commune, téléphone..."
              value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-20 py-3.5 rounded-2xl bg-white border-2 border-gray-200 focus:outline-none text-base placeholder:text-gray-400 shadow-sm"
              style={{ borderColor: searchQuery ? C : undefined }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <motion.button onClick={startVoiceSearch} className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isListening ? C_LIGHT : undefined }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              >
                {isListening ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><MicOff className="w-5 h-5" style={{ color: C }} /></motion.div> : <Mic className="w-5 h-5 text-gray-400" />}
              </motion.button>
              <motion.button onClick={() => setShowFilters(!showFilters)}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${showFilters ? '' : 'border-gray-200 bg-white'}`}
                style={showFilters ? { backgroundColor: C_LIGHT, borderColor: C } : {}} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              >
                <Filter className="w-4 h-4" style={showFilters ? { color: C } : { color: '#9CA3AF' }} />
              </motion.button>
            </div>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-3 shadow-sm">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Région</label>
                    <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); setFilterCommune(''); setPage(1); }}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none bg-white" style={{ borderColor: filterRegion ? C : undefined }}
                    >
                      <option value="">Toutes les régions</option>
                      {Object.keys(REGIONS_CI).sort().map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Commune</label>
                    <select value={filterCommune} onChange={(e) => { setFilterCommune(e.target.value); setPage(1); }} disabled={!filterRegion}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none bg-white disabled:opacity-50" style={{ borderColor: filterCommune ? C : undefined }}
                    >
                      <option value="">{filterRegion ? 'Toutes les communes' : 'Choisir une région d\'abord'}</option>
                      {communesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Performance (Score Jùlaba)</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([{ id: 'all', label: 'Tous' }, { id: 'haut', label: '71-100', color: 'text-green-700 bg-green-50 border-green-200' }, { id: 'moyen', label: '41-70', color: 'text-orange-700 bg-orange-50 border-orange-200' }, { id: 'bas', label: '0-40', color: 'text-red-700 bg-red-50 border-red-200' }] as const).map(({ id, label, color }) => (
                        <motion.button key={id} onClick={() => { setFilterPerf(id); setPage(1); }}
                          className={`py-2 rounded-xl border-2 text-xs font-bold text-center ${filterPerf === id ? (id === 'all' ? 'text-white border-transparent' : (color || '')) : 'border-gray-200 text-gray-500'}`}
                          style={filterPerf === id && id === 'all' ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : {}} whileTap={{ scale: 0.95 }}
                        >{label}</motion.button>
                      ))}
                    </div>
                  </div>
                  {tab === 'actifs' && (
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1.5">Statut</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([{ id: 'all', label: 'Tous' }, { id: 'actif', label: 'Actifs' }, { id: 'suspendu', label: 'Suspendus' }] as const).map(({ id, label }) => (
                          <motion.button key={id} onClick={() => { setFilterStatut(id); setPage(1); }}
                            className={`py-2 rounded-xl border-2 text-xs font-bold ${filterStatut === id ? 'text-white border-transparent' : 'border-gray-200 text-gray-500'}`}
                            style={filterStatut === id ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : {}} whileTap={{ scale: 0.95 }}
                          >{label}</motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  <motion.button onClick={() => { setFilterRegion(''); setFilterCommune(''); setFilterPerf('all'); setFilterStatut('all'); setPage(1); }}
                    className="w-full py-2 rounded-xl border border-gray-200 text-xs text-gray-500 font-semibold" whileTap={{ scale: 0.97 }}
                  >Réinitialiser les filtres</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sections groupées — style Identificateur */}
        {(() => {
          const groupes = [
            { items: membresPagines.filter(m => m.statut === 'actif'), label: 'Actifs', Icon: CheckCircle, iconColor: '#16A34A' },
            { items: membresPagines.filter(m => m.statut === 'en_attente'), label: 'En attente', Icon: Clock, iconColor: '#EA580C' },
            { items: membresPagines.filter(m => m.statut === 'suspendu'), label: 'Suspendus', Icon: ShieldAlert, iconColor: '#DC2626' },
            { items: membresPagines.filter(m => m.statut === 'exclu'), label: 'Archivés', Icon: Archive, iconColor: '#6B7280' },
          ].filter(g => g.items.length > 0);
          if (membresPagines.length === 0) return (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Users className="w-14 h-14 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-semibold">Aucun membre trouvé</p>
              <p className="text-xs text-gray-400 mt-1">Modifiez vos filtres</p>
            </motion.div>
          );
          return (
            <div className="space-y-6">
              {groupes.map(({ items, label, Icon, iconColor }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                    <h2 className="font-bold text-gray-900 text-lg">{label}</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${iconColor}20`, color: iconColor }}>{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">{items.map((m, i) => renderCarte(m, i))}</AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <motion.div
            className="flex items-center justify-center gap-3 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-200 bg-white disabled:opacity-40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5) {
                if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
              }
              return (
                <motion.button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    page === p ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600'
                  }`}
                  style={page === p ? { background: `linear-gradient(135deg, ${C}, ${C_DARK})` } : {}}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {p}
                </motion.button>
              );
            })}

            <motion.button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-200 bg-white disabled:opacity-40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Drawers & Modals */}
      {selectedMembre && !showSuspendModal && !showExcludeModal && !showPromoteModal && renderDrawer()}
      {renderAddModal()}
      {renderSuspendModal()}
      {renderExcludeModal()}
      {renderPromoteModal()}

      <Navigation role="cooperative" />
    </>
  );
}
