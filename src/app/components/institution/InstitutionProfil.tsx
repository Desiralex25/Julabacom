import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Settings,
  Bell,
  Lock,
  LogOut,
  Camera,
  ChevronRight,
  Shield,
  History,
  CheckCircle,
  Globe,
  Mic,
  Moon,
  Building2,
  Download,
  X,
  FileText,
  UserCheck,
  Database,
  Activity,
  Users,
  TrendingUp,
  AlertTriangle,
  Smartphone,
  Wifi,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { InfoPersonnellesModalUniversal } from '../shared/InfoPersonnellesModalUniversal';
import { DocumentsCertificationsModalUniversal } from '../shared/DocumentsCertificationsModalUniversal';
import { SupportCardProfil } from '../shared/SupportCardProfil';
import { DocumentModal } from '../marchand/DocumentModal';
import { DocumentData, DocumentStatus, getStatusColor, getStatusLabel } from '../../types/document';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { PartenairesLogos } from '../shared/PartenairesLogos';

const ROLE_COLOR = '#712864';

// ── Mock données sécurité ─────────────────────────────────────────────────────
const SESSIONS_ACTIVES = [
  { id: 'S001', device: 'Chrome — Windows 11', ip: '196.10.44.21', localisation: 'Abidjan, CI', dernierAcces: '2026-03-03 10:15', actuelle: true },
  { id: 'S002', device: 'Safari — iPhone 14', ip: '196.10.44.88', localisation: 'Abidjan, CI', dernierAcces: '2026-03-02 18:40', actuelle: false },
  { id: 'S003', device: 'Firefox — MacOS', ip: '196.10.44.55', localisation: 'Bouaké, CI', dernierAcces: '2026-03-01 09:22', actuelle: false },
];

const HISTORIQUE_CONNEXIONS = [
  { date: '2026-03-03 10:12', ip: '196.10.44.21', device: 'Chrome — Windows 11', statut: 'succès' },
  { date: '2026-03-02 18:38', ip: '196.10.44.88', device: 'Safari — iPhone 14', statut: 'succès' },
  { date: '2026-03-02 08:01', ip: '196.10.44.21', device: 'Chrome — Windows 11', statut: 'succès' },
  { date: '2026-03-01 09:20', ip: '196.10.44.55', device: 'Firefox — MacOS', statut: 'succès' },
  { date: '2026-02-28 22:15', ip: '185.44.22.10', device: 'Chrome — Linux', statut: 'échoué' },
];

const PERMISSIONS = [
  { groupe: 'Acteurs', active: true, permissions: ['Voir liste acteurs', 'Suspendre acteur', 'Réactiver acteur', 'Voir dossier complet', 'Accéder historique activité'] },
  { groupe: 'Supervision', active: true, permissions: ['Voir transactions globales', 'Filtrer par région/type/période', 'Consulter audit log', 'Exporter rapports (PDF, Excel, CSV)'] },
  { groupe: 'Analytics', active: true, permissions: ['Voir KPIs nationaux', 'Accéder graphiques comparatifs', 'Voir KPI adoption', 'Statistiques individuelles'] },
  { groupe: 'Back-Office (restreint)', active: false, permissions: ['Modifier paramètres système', 'Gérer rôles Super Admin', 'Accéder module financier', 'Modifier configuration globale'] },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function InstitutionProfil() {
  const navigate = useNavigate();
  const { speak, setIsModalOpen } = useApp();
  const { user, updateUser, logout: userLogout } = useUser();

  const [showCarteInstitutionnelle, setShowCarteInstitutionnelle] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showInfoPersonnelles, setShowInfoPersonnelles] = useState(false);
  const [showDocumentsCertifications, setShowDocumentsCertifications] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMdpModal, setShowMdpModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showMdpActuel, setShowMdpActuel] = useState(false);
  const [showNouveauMdp, setShowNouveauMdp] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [documents, setDocuments] = useState<{ [key: string]: DocumentData }>({
    'carte-identite': {
      id: 'doc-001',
      type: 'carte-identite',
      title: 'Carte d\'identité',
      status: 'verified' as DocumentStatus,
      uploadedAt: '2024-01-15T10:00:00Z',
      verifiedAt: '2024-01-15T14:30:00Z',
      verifiedBy: 'Jean Koffi - Bureau Abidjan',
      rejectionReason: null,
      expirationDate: '2029-01-15',
      isLocked: true,
      details: {
        'Numéro': 'CI-2024-001234',
        'Date d\'émission': '15 Jan 2024',
        'Date d\'expiration': '15 Jan 2029',
        'Lieu d\'émission': 'Abidjan, Côte d\'Ivoire',
        'Type': 'Carte Nationale d\'Identité',
      },
    },
    'agrement': {
      id: 'doc-002',
      type: 'agrement',
      title: 'Agrément Institutionnel',
      status: 'verified' as DocumentStatus,
      imageUrl: null,
      uploadedAt: '2024-02-10T08:00:00Z',
      verifiedAt: '2024-02-10T14:00:00Z',
      verifiedBy: 'Direction JULABA CI',
      rejectionReason: null,
      expirationDate: '2027-01-15',
      isLocked: false,
      details: {
        'Numéro d\'agrément': 'AGR-INST-2024-9012',
        'Statut': 'Validé',
        'Type': 'Institution Nationale',
        'Périmètre': 'National — Toutes régions',
      },
    },
    'habilitation': {
      id: 'doc-003',
      type: 'habilitation',
      title: 'Habilitation Supervision',
      status: 'verified' as DocumentStatus,
      imageUrl: null,
      uploadedAt: null,
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
      expirationDate: null,
      isLocked: false,
      details: {
        'Numéro d\'habilitation': 'HAB-SUP-2024-4501',
        'Statut': 'Validé',
        'Niveau': 'Superviseur National',
        'Organisme': 'Ministère du Commerce',
      },
    },
  });

  const totalDocuments = Object.keys(documents).length;
  const completedDocuments = Object.values(documents).filter(d => d.status === 'verified' || d.status === 'pending').length;

  const handleUpdateDocument = (documentType: string, updatedDoc: DocumentData) => {
    setDocuments(prev => ({ ...prev, [documentType]: updatedDoc }));
  };

  // Générer le QR Code
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          id: user?.telephone,
          nom: `${user?.firstName} ${user?.lastName}`,
          role: 'institution',
          telephone: user?.telephone,
        });
        const url = await QRCode.toDataURL(qrData, {
          width: 200, margin: 2,
          color: { dark: ROLE_COLOR, light: '#FFFFFF' },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Erreur QR Code:', err);
      }
    };
    if (user) generateQR();
  }, [user]);

  // Gérer modal state global
  React.useEffect(() => {
    const isAnyModalOpen = showSettings || showMdpModal || show2FAModal ||
      showSessionsModal || showHistoriqueModal || showPermissionsModal ||
      showInfoPersonnelles || showDocumentsCertifications || showDocumentModal !== null;
    setIsModalOpen(isAnyModalOpen);
  }, [showSettings, showMdpModal, show2FAModal, showSessionsModal, showHistoriqueModal,
    showPermissionsModal, showInfoPersonnelles, showDocumentsCertifications, showDocumentModal, setIsModalOpen]);

  const handleLogout = () => {
    speak('À bientôt sur JULABA');
    userLogout?.();
    setTimeout(() => navigate('/'), 1000);
  };

  const handleChangeMdp = () => {
    toast.success('Mot de passe mis à jour', { description: 'Action enregistrée dans l\'audit log' });
    setShowMdpModal(false);
  };

  const handleToggle2FA = () => {
    setTwoFAEnabled(v => !v);
    toast.success(twoFAEnabled ? '2FA désactivée' : '2FA activée', { description: 'Action enregistrée dans l\'audit log' });
    setShow2FAModal(false);
  };

  const handleRevoquerSession = (sessionId: string) => {
    toast.success('Session révoquée', { description: `Session ${sessionId} terminée. Action auditée.` });
  };

  if (!user) return null;

  return (
    <>
      <div className="pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-purple-50 to-white">

        {/* ── 1. CARTE INSTITUTIONNELLE (clone exact de la Carte Pro) ──── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          {/* Bouton Afficher/Masquer + Réglages */}
          <div className="flex items-center gap-3 mb-3">
            <motion.button
              onClick={() => {
                setShowCarteInstitutionnelle(!showCarteInstitutionnelle);
                speak(showCarteInstitutionnelle ? 'Carte masquée' : 'Carte institutionnelle affichée');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-lg text-white"
              style={{ backgroundColor: ROLE_COLOR }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-4 h-4" />
              {showCarteInstitutionnelle ? 'Masquer ma carte' : 'Afficher ma carte'}
            </motion.button>
            {/* Bouton Réglages */}
            <motion.button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-sm border-2"
              style={{ borderColor: ROLE_COLOR, color: ROLE_COLOR, backgroundColor: `${ROLE_COLOR}0f` }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4" />
              Réglages
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {showCarteInstitutionnelle ? (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                  style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                  className="w-full"
                >
                  {/* RECTO — Identité & Rôle */}
                  <motion.div
                    style={{
                      backfaceVisibility: 'hidden',
                      position: isCardFlipped ? 'absolute' : 'relative',
                      width: '100%',
                    }}
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-purple-50/80 via-white to-purple-50/80"
                    style2={{ borderColor: ROLE_COLOR }}
                    onClick={() => { setIsCardFlipped(!isCardFlipped); speak('Retourner la carte'); }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                      style={{ width: '50%' }}
                    />

                    <div className="relative z-10" style={{ borderColor: ROLE_COLOR }}>
                      {/* En-tête */}
                      <div className="flex items-center justify-between mb-6" style={{ borderColor: ROLE_COLOR }}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white border-[3px] flex items-center justify-center shadow-lg" style={{ borderColor: ROLE_COLOR }}>
                            <Shield className="w-6 h-6" style={{ color: ROLE_COLOR }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-600 tracking-widest">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
                            <p className="text-lg font-black" style={{ color: ROLE_COLOR }}>JULABA</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
                          className="w-12 h-12 rounded-xl bg-white shadow-lg border-[3px] flex items-center justify-center"
                          style={{ borderColor: ROLE_COLOR }}
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Settings className="w-5 h-5" style={{ color: ROLE_COLOR }} />
                        </motion.button>
                      </div>

                      {/* Avatar + Nom */}
                      <div className="flex items-start gap-4 mb-6">
                        <motion.div className="relative flex-shrink-0" whileHover={{ scale: 1.05 }} onClick={e => e.stopPropagation()}>
                          <div className="w-28 h-28 rounded-[20px] border-[4px] shadow-xl flex items-center justify-center overflow-hidden"
                            style={{ borderColor: ROLE_COLOR, backgroundColor: '#FAF5FB' }}>
                            <User className="w-14 h-14" style={{ color: ROLE_COLOR }} strokeWidth={2.5} />
                          </div>
                          <motion.button
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-[3px]"
                            style={{ borderColor: ROLE_COLOR }}
                            onClick={e => { e.stopPropagation(); speak('Modifier la photo'); }}
                            whileHover={{ scale: 1.15, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Camera className="w-5 h-5" style={{ color: ROLE_COLOR }} />
                          </motion.button>
                        </motion.div>

                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 mb-1">INSTITUTION NATIONALE AGRÉÉE</p>
                          <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mb-2">
                            {user.firstName}<br />{user.lastName}
                          </h1>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4" style={{ color: ROLE_COLOR }} />
                            <p className="text-sm font-bold text-gray-700">{user.telephone}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 border-2 border-green-300">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs font-bold text-green-700">Vérifié</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Infos rôle — Grid 2 colonnes */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <InfoField icon={UserCheck} label="Rôle" value="Superviseur National" />
                        <InfoField icon={Globe} label="Périmètre" value="National" />
                        <InfoField icon={Shield} label="Niveau accès" value="Niveau 3" />
                        <InfoField icon={Building2} label="Organisme" value="Min. Commerce" />
                      </div>

                      {/* Organisme */}
                      <div className="p-4 rounded-[20px] bg-gradient-to-r from-purple-100/50 to-purple-50/50 border-2" style={{ borderColor: `${ROLE_COLOR}40` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4" style={{ color: ROLE_COLOR }} />
                          <p className="text-xs font-bold text-gray-600">Institution</p>
                        </div>
                        <p className="text-sm font-black text-gray-900">Ministère du Commerce — Direction Nationale</p>
                      </div>

                      <motion.div className="mt-4 text-center" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                        <p className="text-xs font-bold text-gray-500">Appuyez pour voir les permissions</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* VERSO — Permissions & QR */}
                  <motion.div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      position: isCardFlipped ? 'relative' : 'absolute',
                      width: '100%',
                      top: 0,
                    }}
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-purple-50/80 via-white to-purple-50/80"
                    style2={{ borderColor: ROLE_COLOR }}
                    onClick={() => { setIsCardFlipped(!isCardFlipped); speak('Retourner la carte'); }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                      style={{ width: '50%' }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900">Permissions & Accès</h3>
                        <motion.button
                          onClick={e => { e.stopPropagation(); speak('Télécharger la carte'); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs shadow-md text-white"
                          style={{ backgroundColor: ROLE_COLOR }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </motion.button>
                      </div>

                      {/* QR Code + Niveau */}
                      <div className="flex items-center gap-4 mb-6">
                        {qrCodeUrl && (
                          <div className="w-28 h-28 rounded-[16px] border-[3px] p-2 bg-white shadow-lg" style={{ borderColor: ROLE_COLOR }}>
                            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-600 mb-2">Niveau d'accès</p>
                          <motion.p className="text-5xl font-black" style={{ color: ROLE_COLOR }}
                            animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            N3
                          </motion.p>
                          <p className="text-xs text-gray-500 mt-1">Superviseur National</p>
                        </div>
                      </div>

                      {/* Permissions résumées */}
                      <div className="grid grid-cols-2 gap-3">
                        {PERMISSIONS.filter(p => p.active).map(p => (
                          <div key={p.groupe} className="p-3 rounded-[16px] bg-green-50 border-2 border-green-200">
                            <CheckCircle className="w-4 h-4 text-green-600 mb-1" />
                            <p className="text-xs font-bold text-green-700">{p.groupe}</p>
                            <p className="text-xs text-green-600">{p.permissions.length} droits</p>
                          </div>
                        ))}
                      </div>

                      <motion.div className="mt-4 text-center" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                        <p className="text-xs font-bold text-gray-500">Appuyez pour voir le recto</p>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 rounded-[32px] bg-gradient-to-br from-purple-50 via-white to-purple-50 border-[3px] shadow-lg text-center"
                style={{ borderColor: ROLE_COLOR }}
              >
                <motion.div className="flex flex-col items-center gap-4" animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center shadow-lg border-[3px]" style={{ borderColor: ROLE_COLOR }}>
                    <Shield className="w-10 h-10" style={{ color: ROLE_COLOR }} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 mb-2">Carte institutionnelle JULABA</p>
                    <p className="text-sm text-gray-600">Appuyez sur "Afficher" pour voir votre carte digitale</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── 2. PERMISSIONS DÉTAILLÉES (remplace Academy) ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => { setShowPermissionsModal(true); speak('Ouverture des permissions détaillées'); }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-purple-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: `${ROLE_COLOR}40` }}
            whileHover={{ scale: 1.02, borderColor: ROLE_COLOR }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Database className="w-6 h-6" style={{ color: ROLE_COLOR }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Permissions détaillées</h3>
                <p className="text-xs text-gray-500">{PERMISSIONS.filter(p => p.active).reduce((s, p) => s + p.permissions.length, 0)} droits actifs sur 4 modules</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* ── 3. STATS KPI (remplace Score + Fiche) ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-purple-50 via-white to-purple-50 shadow-md"
              style={{ borderColor: ROLE_COLOR }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-sm text-gray-600">Acteurs</p>
                  <p className="text-xs text-gray-500">supervisés national</p>
                </div>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                  <Users className="w-5 h-5" style={{ color: ROLE_COLOR }} />
                </motion.div>
              </div>
              <p className="text-3xl font-bold" style={{ color: ROLE_COLOR }}>18 440</p>
            </motion.div>

            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-teal-50 via-white to-teal-50 shadow-md"
              style={{ borderColor: '#0D9488' }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-sm text-gray-600">Volume</p>
                  <p className="text-xs text-gray-500">transactions Mds FCFA</p>
                </div>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-100">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-teal-600">4.86</p>
            </motion.div>
          </div>
        </motion.div>

        {/* ── 4. INFORMATIONS PERSONNELLES ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => { setShowInfoPersonnelles(true); speak('Ouverture des informations personnelles'); }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-purple-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: `${ROLE_COLOR}40` }}
            whileHover={{ scale: 1.02, borderColor: ROLE_COLOR }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <User className="w-6 h-6" style={{ color: ROLE_COLOR }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
                <p className="text-xs text-gray-500">Gérer mes coordonnées</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* ── 5. ACTIVITÉ DE SUPERVISION (remplace Activité du mois) ──────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Activit de supervision</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} label="Nouveaux inscrits" value="127" color={ROLE_COLOR} bgColor="from-purple-50 via-white to-purple-50" borderColor={`${ROLE_COLOR}50`} delay={0.1} />
            <StatCard icon={CheckCircle} label="Dossiers validés" value="84" color="#16A34A" bgColor="from-green-50 via-white to-green-50" borderColor="#16A34A50" delay={0.2} />
            <StatCard icon={Activity} label="Transactions jour" value="1 342" color="#2072AF" bgColor="from-blue-50 via-white to-blue-50" borderColor="#2072AF50" delay={0.3} />
            <StatCard icon={AlertTriangle} label="Alertes actives" value="3" color="#DC2626" bgColor="from-red-50 via-white to-red-50" borderColor="#DC262650" delay={0.4} />
          </div>
        </motion.div>

        {/* ── 6. DOCUMENTS & CERTIFICATIONS ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => { setShowDocumentsCertifications(true); speak('Ouverture des documents et certifications'); }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-200 shadow-md flex items-center justify-between"
            whileHover={{ scale: 1.02, borderColor: '#2072AF' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6" style={{ color: '#2072AF' }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Documents & Certifications</h3>
                <p className="text-xs text-gray-500">{completedDocuments}/{totalDocuments} documents vérifiés</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Support & Aide */}
        <SupportCardProfil role="institution" delay={0.45} />

        {/* ── 7. HISTORIQUE CONNEXIONS (DocumentCard style) ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <DocumentCard
            icon={History}
            label="Historique connexions"
            status="5 connexions"
            statusColor="blue"
            date={`Dernière : 03 Mar 2026 à 10h12`}
            onClick={() => { setShowHistoriqueModal(true); speak('Ouverture de l\'historique de connexions'); }}
          />
        </motion.div>

        {/* ── 8. ACTIONS RAPIDES (clone exact de l'Identificateur) ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setShowSettings(true)}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: ROLE_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="w-6 h-6" style={{ color: ROLE_COLOR }} />
              <p className="font-bold text-sm text-gray-900">Notifications</p>
            </motion.button>

            <motion.button
              onClick={() => setShowMdpModal(true)}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: ROLE_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock className="w-6 h-6" style={{ color: ROLE_COLOR }} />
              <p className="font-bold text-sm text-gray-900">Mot de passe</p>
            </motion.button>

            <motion.button
              onClick={() => setShow2FAModal(true)}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: ROLE_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Smartphone className="w-6 h-6" style={{ color: ROLE_COLOR }} />
              <p className="font-bold text-sm text-gray-900">2FA {twoFAEnabled ? 'ON' : 'OFF'}</p>
            </motion.button>

            <motion.button
              onClick={() => setShowSessionsModal(true)}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: ROLE_COLOR }}
              whileTap={{ scale: 0.98 }}
            >
              <Wifi className="w-6 h-6" style={{ color: ROLE_COLOR }} />
              <p className="font-bold text-sm text-gray-900">Sessions</p>
            </motion.button>
          </div>
        </motion.div>

        {/* ── 9. DÉCONNEXION (clone exact) ─────────────────────────────────── */}
        <motion.button
          onClick={handleLogout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}
          className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-red-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-6 h-6" />
          Se déconnecter
        </motion.button>

        <PartenairesLogos />

      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* Info Personnelles */}
      <AnimatePresence>
        {showInfoPersonnelles && (
          <InfoPersonnellesModalUniversal
            onClose={() => setShowInfoPersonnelles(false)}
            speak={speak}
            roleColor={ROLE_COLOR}
            user={user}
            onSave={(updatedData) => {
              updateUser({ ...user, telephone: updatedData.telephone, email: updatedData.email, localisation: updatedData.localisation });
            }}
          />
        )}
      </AnimatePresence>

      {/* Documents & Certifications */}
      <AnimatePresence>
        {showDocumentsCertifications && (
          <DocumentsCertificationsModalUniversal
            onClose={() => setShowDocumentsCertifications(false)}
            speak={speak}
            documents={documents}
            onDocumentClick={(documentType) => { setShowDocumentsCertifications(false); setShowDocumentModal(documentType); }}
            totalDocuments={totalDocuments}
            completedDocuments={completedDocuments}
            roleColor={ROLE_COLOR}
          />
        )}
      </AnimatePresence>

      {/* Modals Documents */}
      {(['carte-identite', 'agrement', 'habilitation'] as const).map(docType => (
        <AnimatePresence key={docType}>
          {showDocumentModal === docType && (
            <DocumentModal
              onClose={() => setShowDocumentModal(null)}
              speak={speak}
              document={documents[docType]}
              icon={FileText}
              onUpdate={(updatedDoc) => handleUpdateDocument(docType, updatedDoc)}
              totalDocuments={totalDocuments}
              completedDocuments={completedDocuments}
            />
          )}
        </AnimatePresence>
      ))}

      {/* Modal Paramètres */}
      <AnimatePresence>
        {showSettings && (
          <BottomModal title="Paramètres" onClose={() => setShowSettings(false)}>
            <div className="space-y-4">
              {[
                { label: 'Notifications push', icon: <Bell className="w-4 h-4" />, enabled: notificationsEnabled, toggle: () => setNotificationsEnabled(v => !v) },
                { label: 'Mode sombre', icon: <Moon className="w-4 h-4" />, enabled: darkMode, toggle: () => setDarkMode(v => !v) },
                { label: 'Assistance vocale', icon: <Mic className="w-4 h-4" />, enabled: true, toggle: () => {} },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span style={{ color: ROLE_COLOR }}>{pref.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{pref.label}</span>
                  </div>
                  <motion.button onClick={pref.toggle}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${pref.enabled ? '' : 'bg-gray-300'}`}
                    style={pref.enabled ? { backgroundColor: ROLE_COLOR } : {}}
                    whileTap={{ scale: 0.95 }}>
                    <motion.div className="w-4 h-4 bg-white rounded-full shadow" animate={{ x: pref.enabled ? 24 : 0 }} transition={{ type: 'spring', stiffness: 400 }} />
                  </motion.button>
                </div>
              ))}
            </div>
          </BottomModal>
        )}
      </AnimatePresence>

      {/* Modal Changer MDP */}
      <AnimatePresence>
        {showMdpModal && (
          <BottomModal title="Changer le mot de passe" onClose={() => setShowMdpModal(false)}>
            <div className="space-y-4">
              {[
                { label: 'Mot de passe actuel', show: showMdpActuel, setShow: setShowMdpActuel },
                { label: 'Nouveau mot de passe', show: showNouveauMdp, setShow: setShowNouveauMdp },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-sm font-bold text-gray-700 block mb-2">{field.label}</label>
                  <div className="relative">
                    <input type={field.show ? 'text' : 'password'}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none bg-white"
                      style={{ borderColor: `${ROLE_COLOR}40` }}
                      placeholder="••••••••" />
                    <button onClick={() => field.setShow(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {field.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
              <motion.button onClick={handleChangeMdp} className="w-full py-4 rounded-2xl text-white font-bold"
                style={{ backgroundColor: ROLE_COLOR }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Confirmer le changement
              </motion.button>
            </div>
          </BottomModal>
        )}
      </AnimatePresence>

      {/* Modal 2FA */}
      <AnimatePresence>
        {show2FAModal && (
          <BottomModal title="Authentification 2FA" onClose={() => setShow2FAModal(false)}>
            <div className="space-y-4">
              <div className={`rounded-2xl p-4 border-2 text-center ${twoFAEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <Smartphone className={`w-10 h-10 mx-auto mb-2 ${twoFAEnabled ? 'text-green-600' : 'text-red-500'}`} />
                <p className={`font-bold ${twoFAEnabled ? 'text-green-700' : 'text-red-700'}`}>2FA {twoFAEnabled ? 'activée' : 'désactivée'}</p>
                <p className="text-sm text-gray-600 mt-1">{twoFAEnabled ? 'Code OTP requis à chaque connexion.' : 'Compte non protégé par 2FA.'}</p>
              </div>
              <motion.button onClick={handleToggle2FA}
                className={`w-full py-4 rounded-2xl text-white font-bold ${twoFAEnabled ? 'bg-red-500' : 'bg-green-600'}`}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {twoFAEnabled ? 'Désactiver la 2FA' : 'Activer la 2FA'}
              </motion.button>
            </div>
          </BottomModal>
        )}
      </AnimatePresence>

      {/* Modal Sessions actives */}
      <AnimatePresence>
        {showSessionsModal && (
          <BottomModal title="Sessions actives" onClose={() => setShowSessionsModal(false)}>
            <div className="space-y-3">
              {SESSIONS_ACTIVES.map(s => (
                <div key={s.id} className={`rounded-2xl p-4 border-2 ${s.actuelle ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">{s.device}</p>
                        {s.actuelle && <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">Session actuelle</span>}
                      </div>
                      <p className="text-xs text-gray-500">IP : {s.ip} — {s.localisation}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Dernier accès : {s.dernierAcces}</p>
                    </div>
                    {!s.actuelle && (
                      <motion.button onClick={() => handleRevoquerSession(s.id)}
                        className="ml-3 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        Révoquer
                      </motion.button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </BottomModal>
        )}
      </AnimatePresence>

      {/* Modal Historique connexions */}
      <AnimatePresence>
        {showHistoriqueModal && (
          <BottomModal title="Historique connexions" onClose={() => setShowHistoriqueModal(false)}>
            <div className="space-y-3">
              {HISTORIQUE_CONNEXIONS.map((h, i) => (
                <div key={i} className={`rounded-2xl p-4 border-2 ${h.statut === 'succès' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${h.statut === 'succès' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.statut}</span>
                    <span className="text-xs text-gray-500">{h.date}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{h.device}</p>
                  <p className="text-xs text-gray-500 mt-0.5">IP : {h.ip}</p>
                </div>
              ))}
            </div>
          </BottomModal>
        )}
      </AnimatePresence>

      {/* Modal Permissions */}
      <AnimatePresence>
        {showPermissionsModal && (
          <BottomModal title="Permissions détaillées" onClose={() => setShowPermissionsModal(false)}>
            <div className="space-y-4">
              {PERMISSIONS.map(groupe => (
                <div key={groupe.groupe}>
                  <div className={`flex items-center gap-2 mb-2 px-3 py-1.5 rounded-2xl inline-flex ${groupe.active ? 'bg-green-50' : 'bg-red-50'}`}>
                    {groupe.active ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <p className={`text-sm font-bold ${groupe.active ? 'text-green-700' : 'text-red-700'}`}>{groupe.groupe}</p>
                  </div>
                  <div className="space-y-1.5 ml-2">
                    {groupe.permissions.map(p => (
                      <div key={p} className={`flex items-center gap-2 text-sm py-1 px-3 rounded-xl ${groupe.active ? 'text-gray-700' : 'text-red-400 bg-red-50/50'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${groupe.active ? 'bg-green-500' : 'bg-red-400'}`} />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </BottomModal>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Composants helpers — identiques à IdentificateurProfil ────────────────────

interface InfoFieldProps { icon: any; label: string; value: string; }
function InfoField({ icon: Icon, label, value }: InfoFieldProps) {
  return (
    <div className="p-3 rounded-[16px] bg-white/60 border-2 border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3 text-gray-500" />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate">{label}</p>
      </div>
      <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
    </div>
  );
}

interface StatCardProps { icon: any; label: string; value: string; color: string; bgColor: string; borderColor: string; delay: number; }
function StatCard({ icon: Icon, label, value, color, bgColor, borderColor, delay }: StatCardProps) {
  return (
    <motion.div
      className={`p-4 rounded-3xl bg-gradient-to-br ${bgColor} border-2 shadow-md`}
      style={{ borderColor }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </motion.div>
  );
}

interface DocumentCardProps { icon: any; label: string; status: string; statusColor: 'green' | 'blue' | 'orange' | 'red'; date: string; onClick: () => void; }
function DocumentCard({ icon: Icon, label, status, statusColor, date, onClick }: DocumentCardProps) {
  const statusColors = {
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  };
  const colors = statusColors[statusColor];
  return (
    <motion.div
      className="p-4 rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 border-gray-200 shadow-md flex items-center justify-between cursor-pointer"
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-6 h-6" style={{ color: ROLE_COLOR }} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>{status}</span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );
}

function BottomModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 text-xl">{title}</h2>
          <motion.button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <X className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}