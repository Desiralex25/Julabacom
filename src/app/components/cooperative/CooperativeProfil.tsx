import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  Bell,
  Lock,
  LogOut,
  Edit3,
  Camera,
  ChevronRight,
  ChevronDown,
  Shield,
  CreditCard,
  Wallet,
  BarChart3,
  History,
  Star,
  CheckCircle,
  AlertCircle,
  Globe,
  Mic,
  Volume2,
  Moon,
  Mail,
  Building2,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Download,
  X,
  Share2,
  Info,
  GraduationCap,
  Users,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useModalRegister } from '../../contexts/ModalContext';
import { useUser } from '../../contexts/UserContext';
import { Navigation } from '../layout/Navigation';
import { Button } from '../ui/button';
import { Counter } from '../ui/counter';
import { InfoPersonnellesModalUniversal } from '../shared/InfoPersonnellesModalUniversal';
import { DocumentsCertificationsModalUniversal } from '../shared/DocumentsCertificationsModalUniversal';
import { SupportCardProfil } from '../shared/SupportCardProfil';
import { DocumentModal } from '../marchand/DocumentModal';
import { IdentificationInfoBadge } from '../shared/IdentificationInfoBadge';
import { FicheIdentificationModal } from '../marchand/FicheIdentificationModal';
import { DocumentData, DocumentStatus, getStatusColor, getStatusLabel } from '../../types/document';
import QRCode from 'qrcode';
import { PartenairesLogos } from '../shared/PartenairesLogos';


export function CooperativeProfil() {
  const navigate = useNavigate();
  const { speak } = useApp();
  const { user, updateUser, logout: userLogout } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showLangue, setShowLangue] = useState(false);
  const [showSecurityCode, setShowSecurityCode] = useState(false);
  const [showConfidentialite, setShowConfidentialite] = useState(false);
  const [showProfessionalCard, setShowProfessionalCard] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showFicheIdentification, setShowFicheIdentification] = useState(false);
  const [showInfoPersonnelles, setShowInfoPersonnelles] = useState(false);
  const [showDocumentsCertifications, setShowDocumentsCertifications] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState<string | null>(null);
  const [showLegalDocModal, setShowLegalDocModal] = useState<string | null>(null);

  const roleColor = '#2072AF';

  // Documents légaux de la coopérative (lecture seule, photos d'enrôlement)
  const legalDocuments = [
    {
      id: 'recepisse-coop',
      label: 'Récépissé de coopérative',
      numero: 'REC-COOP-2024-9012',
      dateEmission: '12 Jan 2024',
      status: 'valide' as const,
      delivrePar: 'Ministère du Commerce, Abidjan',
    },
    {
      id: 'statuts',
      label: 'Statuts de la coopérative',
      numero: 'STAT-CI-2024-4521',
      dateEmission: '10 Jan 2024',
      status: 'valide' as const,
      delivrePar: 'Notaire Kouassi Jean - Abidjan',
    },
    {
      id: 'agrement',
      label: 'Agrément ministériel',
      numero: 'AGR-MIN-2024-0781',
      dateEmission: '20 Fév 2024',
      status: 'en-attente' as const,
      delivrePar: 'Ministère de l\'Agriculture',
      imageUrl: null,
    },
  ];

  // Variation membres ce mois
  const membresVariation = +3;

  // Stats Coopérative (mock data)
  const totalMembres = 45;
  const totalProductions = 12500;
  const totalTransactions = 238;
  const totalVentes = 8750000;

  // État des documents avec données complètes
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
    'certification-julaba': {
      id: 'doc-002',
      type: 'certification-julaba',
      title: 'Certification JULABA Coopérative',
      status: 'verified' as DocumentStatus,
      uploadedAt: '2024-02-20T08:00:00Z',
      verifiedAt: '2024-02-20T14:00:00Z',
      verifiedBy: 'Aminata Touré - JULABA',
      rejectionReason: null,
      expirationDate: '2025-01-15',
      isLocked: false,
      details: {
        'Numéro de certification': 'CERT-JULABA-COOP-2024-5678',
        'Date d\'obtention': '15 Jan 2024',
        'Date d\'expiration': '15 Jan 2025',
        'Niveau': 'Coopérative Certifiée',
        'Score': '96/100',
        'Délivré par': 'JULABA CI - Siège National',
      },
    },
    'recepisse': {
      id: 'doc-003',
      type: 'recepisse',
      title: 'Récépissé',
      status: 'verified' as DocumentStatus,
      imageUrl: null,
      uploadedAt: null,
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
      expirationDate: null,
      isLocked: false,
      details: {
        'Numéro de récépissé': 'REC-COOP-2024-9012',
        'Statut': 'Validé',
        'Zone d\'activité': user?.market || 'Zone agricole',
      },
    },
  });

  const handleUpdateDocument = (documentType: string, updatedDoc: DocumentData) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: updatedDoc
    }));
  };

  const totalDocuments = Object.keys(documents).length;
  const completedDocuments = Object.values(documents).filter(d => d.status === 'verified' || d.status === 'pending').length;

  // Générer le QR Code
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          id: user.numeroMarchand || user.telephone,
          nom: `${user.prenoms} ${user.nom}`,
          role: 'cooperative',
          telephone: user.telephone,
        });
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: '#2072AF', light: '#FFFFFF' },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Erreur génération QR Code:', err);
      }
    };
    if (user) generateQR();
  }, [user]);

  // Sync ModalContext
  useModalRegister(
    showSettings || showDocuments || showLangue || showSecurityCode ||
    showConfidentialite || showFicheIdentification || showInfoPersonnelles ||
    showDocumentsCertifications || showDocumentModal !== null || showLegalDocModal !== null
  );

  const handleLogout = () => {
    speak('Déconnexion en cours');
    userLogout();
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  if (!user) return null;

  return (
    <>
      <div className="pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-blue-50 to-white">
        
        {/* 🎴 MA CARTE PROFESSIONNELLE - Style Moderne avec Flip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          {/* Header avec boutons actions */}
          <div className="flex items-center gap-3 mb-3">
            {/* Bouton Afficher/Masquer carte */}
            <motion.button
              onClick={() => {
                setShowProfessionalCard(!showProfessionalCard);
                speak(showProfessionalCard ? 'Carte masquée' : 'Carte affichée');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-lg text-white"
              style={{ backgroundColor: roleColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CreditCard className="w-4 h-4" />
              {showProfessionalCard ? 'Masquer ma carte' : 'Afficher ma carte'}
            </motion.button>
            {/* Bouton Réglages */}
            <motion.button
              onClick={() => navigate('/cooperative/parametres')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-sm border-2"
              style={{ borderColor: roleColor, color: roleColor, backgroundColor: `${roleColor}0f` }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4" />
              Réglages
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {showProfessionalCard ? (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                style={{ perspective: '1000px' }}
              >
                {/* Conteneur 3D pour le flip */}
                <motion.div
                  animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                  style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                  className="w-full"
                >
                  {/* RECTO - Infos Personnelles */}
                  <motion.div
                    style={{
                      backfaceVisibility: 'hidden',
                      position: isCardFlipped ? 'absolute' : 'relative',
                      width: '100%',
                    }}
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80"
                    onClick={() => {
                      setIsCardFlipped(!isCardFlipped);
                      speak('Retourner la carte');
                    }}
                  >
                    {/* Effet de brillance animé */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                      style={{ width: '50%', borderColor: roleColor }}
                    />

                    <div className="relative z-10">
                      {/* En-tête avec logo et bouton paramètres */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white border-[3px] flex items-center justify-center shadow-lg" style={{ borderColor: roleColor }}>
                            <Shield className="w-6 h-6" style={{ color: roleColor }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-600 tracking-widest">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
                            <p className="text-lg font-black" style={{ color: roleColor }}>JULABA</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            speak('Ouverture des paramètres');
                            navigate('/cooperative/parametres');
                          }}
                          className="w-12 h-12 rounded-xl bg-white shadow-lg border-[3px] flex items-center justify-center"
                          style={{ borderColor: roleColor }}
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Settings className="w-5 h-5" style={{ color: roleColor }} />
                        </motion.button>
                      </div>

                      {/* Photo + Nom */}
                      <div className="flex items-start gap-4 mb-6">
                        <motion.div
                          className="relative flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div 
                            className="w-28 h-28 rounded-[20px] border-[4px] shadow-xl flex items-center justify-center overflow-hidden"
                            style={{ borderColor: roleColor, backgroundColor: '#EFF6FF' }}
                          >
                            {user.photo ? (
                              <img src={user.photo} alt={`${user.prenoms} ${user.nom}`} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-14 h-14" style={{ color: roleColor }} strokeWidth={2.5} />
                            )}
                          </div>
                          <motion.button
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-[3px]"
                            style={{ borderColor: roleColor }}
                            onClick={(e) => {
                              e.stopPropagation();
                              speak('Modifier la photo');
                            }}
                            whileHover={{ scale: 1.15, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Camera className="w-5 h-5" style={{ color: roleColor }} />
                          </motion.button>
                        </motion.div>

                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 mb-1">COOPÉRATIVE AGRÉÉE</p>
                          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">
                            {user.prenoms}
                            <br />
                            {user.nom}
                          </h1>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4" style={{ color: roleColor }} />
                            <p className="text-sm font-bold text-gray-700">{user.numeroMarchand || user.telephone}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 border-2 border-green-300">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs font-bold text-green-700">{user.statut}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Infos personnelles - Grid 2 colonnes */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <InfoField icon={Calendar} label="Date de création" value={user.dateNaissance || '01/01/2020'} />
                        <InfoField icon={Globe} label="Nationalité" value={user.nationalite || 'Ivoirienne'} />
                        <InfoField icon={FileText} label="N° CNI" value={user.cni || 'CI2024******'} />
                        <InfoField icon={Users} label="Membres" value={`${totalMembres}`} />
                      </div>

                      {/* Zone d'activité */}
                      <div className="p-4 rounded-[20px] bg-gradient-to-r from-blue-100/50 to-cyan-100/50 border-2" style={{ borderColor: `${roleColor}40` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" style={{ color: roleColor }} />
                          <p className="text-xs font-bold text-gray-600">Zone d'activité</p>
                        </div>
                        <p className="text-sm font-black text-gray-900">{user.market || user.localisation || 'Zone coopérative'}</p>
                      </div>

                      {/* Indication flip */}
                      <motion.div 
                        className="mt-4 text-center"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <p className="text-xs font-bold text-gray-500">👆 Cliquez pour voir le verso</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* VERSO - Infos Professionnelles */}
                  <motion.div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      position: isCardFlipped ? 'relative' : 'absolute',
                      width: '100%',
                      top: 0,
                    }}
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80"
                    onClick={() => {
                      setIsCardFlipped(!isCardFlipped);
                      speak('Retourner la carte');
                    }}
                  >
                    {/* Effet de brillance animé */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                      style={{ width: '50%', borderColor: roleColor }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900">Informations professionnelles</h3>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            speak('Télécharger la carte');
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs shadow-md text-white"
                          style={{ backgroundColor: '#00563B' }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </motion.button>
                      </div>

                      {/* QR Code + Score */}
                      <div className="flex items-center gap-4 mb-6">
                        {qrCodeUrl && (
                          <div className="w-28 h-28 rounded-[16px] border-[3px] p-2 bg-white shadow-lg" style={{ borderColor: roleColor }}>
                            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-600 mb-2">Score JULABA</p>
                          <motion.p
                            className="text-5xl font-black"
                            style={{ color: roleColor }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Counter value={user.scoreCredit} duration={1500} />
                          </motion.p>
                        </div>
                      </div>

                      {/* Infos pro - Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <InfoField icon={MapPin} label="Zone" value={user.market || user.localisation} />
                        <InfoField icon={Building2} label="Commune" value={user.commune || 'Abidjan'} />
                        <InfoField icon={Phone} label="Téléphone" value={user.telephone} />
                        <InfoField icon={Mail} label="Email" value={user.email || 'cooperative@julaba.ci'} />
                      </div>

                      {/* Stats Coopérative */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-[16px] bg-blue-100/50 border-2 border-blue-200">
                          <p className="text-xs font-bold text-gray-600 mb-1">Membres</p>
                          <p className="text-lg font-black text-blue-600">{totalMembres}</p>
                        </div>
                        <div className="p-3 rounded-[16px] bg-green-100/50 border-2 border-green-200">
                          <p className="text-xs font-bold text-gray-600 mb-1">Transactions</p>
                          <p className="text-lg font-black text-green-600">{totalTransactions}</p>
                        </div>
                      </div>

                      {/* Indication flip */}
                      <motion.div 
                        className="mt-4 text-center"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <p className="text-xs font-bold text-gray-500">👆 Cliquez pour voir le recto</p>
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
                className="p-8 rounded-[32px] bg-gradient-to-br from-blue-50 via-white to-blue-50 border-[3px] shadow-lg text-center"
                style={{ borderColor: roleColor }}
              >
                <motion.div
                  className="flex flex-col items-center gap-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-lg border-[3px]" style={{ borderColor: roleColor }}>
                    <CreditCard className="w-10 h-10" style={{ color: roleColor }} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 mb-2">Carte professionnelle JULABA</p>
                    <p className="text-sm text-gray-600">Cliquez sur "Afficher" pour voir votre carte digitale</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bouton Jùlaba Academy - Juste sous la carte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => {
              speak('Ouverture de JÙLABA Academy');
              navigate('/cooperative/academy');
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: `${roleColor}40` }}
            whileHover={{ scale: 1.02, borderColor: roleColor }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" style={{ color: roleColor }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">JÙLABA Academy</h3>
                <p className="text-xs text-gray-500">Formations et micro-apprentissages</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Wallet — Bouton cliquable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => {
              speak('Ouverture du Wallet');
              navigate('/cooperative/wallet');
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: `${roleColor}40` }}
            whileHover={{ scale: 1.02, borderColor: roleColor }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Wallet className="w-6 h-6" style={{ color: roleColor }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Mon Wallet</h3>
                <p className="text-xs text-gray-500">Solde, recharge, historique</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Fiche d'identification - Badge unifié */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <IdentificationInfoBadge
            numeroFiche={(user as any).numeroCooperative || 'COOP-2026-0001'}
            nomAgent={(user as any).nomAgent || 'BAMBA'}
            prenomAgent={(user as any).prenomAgent || 'Issa'}
            dateIdentification={(user as any).dateIdentification || '2026-02-10T09:30:00Z'}
            statut={((user as any).statutIdentification as any) || 'valide'}
            raisonsRejet={(user as any).raisonsRejetIdentification}
            accentColor={roleColor}
            onVoirFiche={() => {
              setShowFicheIdentification(true);
              speak('Ouverture de la fiche d\'identification');
            }}
          />
        </motion.div>

        {/* Stats KPIs - Style Dashboard en 2 colonnes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Total Membres */}
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-md"
              style={{ borderColor: roleColor }}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(32, 114, 175, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Membres
                  </p>
                  <p className="text-xs text-gray-600">Total actifs</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-blue-600">{totalMembres}</p>
            </motion.div>

            {/* Total Transactions */}
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-green-50 via-white to-green-50 shadow-md"
              style={{ borderColor: '#16A34A' }}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(22, 163, 74, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Transactions
                  </p>
                  <p className="text-xs text-gray-600">Total effectuées</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100"
                >
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-green-600">{totalTransactions}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Informations Personnelles - Modal Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => {
              setShowInfoPersonnelles(true);
              speak('Ouverture des informations personnelles');
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: `${roleColor}40` }}
            whileHover={{ scale: 1.02, borderColor: roleColor }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6" style={{ color: roleColor }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
                <p className="text-xs text-gray-500">Gérer mes coordonnées</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Support & Aide */}
        <SupportCardProfil role="cooperative" delay={0.28} />

        {/* Activité du mois - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Activité du mois</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Users}
              label="Membres"
              value={`${totalMembres}`}
              color={roleColor}
              bgColor="from-blue-50 via-white to-blue-50"
              borderColor="border-blue-200"
              delay={0.1}
            />
            <StatCard
              icon={Package}
              label="Productions"
              value={`${totalProductions} kg`}
              color="#16A34A"
              bgColor="from-green-50 via-white to-green-50"
              borderColor="border-green-200"
              delay={0.2}
            />
            <StatCard
              icon={BarChart3}
              label="Transactions"
              value={`${totalTransactions}`}
              color="#F59E0B"
              bgColor="from-orange-50 via-white to-orange-50"
              borderColor="border-orange-200"
              delay={0.3}
            />
            <StatCard
              icon={ShoppingBag}
              label="Ventes"
              value={`${(totalVentes / 1000000).toFixed(1)}M FCFA`}
              color="#C46210"
              bgColor="from-orange-50 via-white to-orange-50"
              borderColor="border-orange-300"
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Actions rapides - Style Dashboard */}
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
              whileHover={{ scale: 1.02, y: -2, borderColor: roleColor }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="w-6 h-6" style={{ color: roleColor }} />
              <p className="font-bold text-sm text-gray-900">Notifications</p>
            </motion.button>

            <motion.button
              onClick={() => {
                setShowSecurityCode(true);
                speak('Changer le mot de passe');
              }}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: roleColor }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock className="w-6 h-6" style={{ color: roleColor }} />
              <p className="font-bold text-sm text-gray-900">Sécurité</p>
            </motion.button>

            <motion.button
              onClick={() => setShowSettings(true)}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: roleColor }}
              whileTap={{ scale: 0.98 }}
            >
              <Volume2 className="w-6 h-6" style={{ color: roleColor }} />
              <p className="font-bold text-sm text-gray-900">Assistance</p>
            </motion.button>

            <motion.button
              onClick={() => {
                setShowLangue(true);
                speak('Langue et région');
              }}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm"
              whileHover={{ scale: 1.02, y: -2, borderColor: roleColor }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="w-6 h-6" style={{ color: roleColor }} />
              <p className="font-bold text-sm text-gray-900">Langue</p>
            </motion.button>
          </div>
        </motion.div>

        {/* IDENTITE DE LA COOPERATIVE - Nouvelle carte */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 180 }}
          className="mb-4"
        >
          <div
            className="p-5 rounded-3xl border-2 shadow-lg bg-gradient-to-br from-blue-50 via-white to-cyan-50"
            style={{ borderColor: roleColor }}
          >
            {/* En-tête */}
            <div className="flex items-center gap-3 mb-5">
              <motion.div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${roleColor}20`, border: `2px solid ${roleColor}40` }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Building2 className="w-6 h-6" style={{ color: roleColor }} />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900">Identité de la Coopérative</h3>
                <p className="text-xs text-gray-500">Informations officielles enregistrées</p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300">
                <Lock className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-bold text-blue-700">Lecture seule</span>
              </div>
            </div>

            {/* Statut juridique */}
            <motion.div
              className="mb-3 p-4 rounded-2xl bg-white border-2 flex items-center justify-between"
              style={{ borderColor: `${roleColor}30` }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" style={{ color: roleColor }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Statut juridique</p>
                  <p className="font-black text-gray-900">Association</p>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2"
                style={{ borderColor: `${roleColor}50`, backgroundColor: `${roleColor}10` }}
              >
                <Shield className="w-3 h-3" style={{ color: roleColor }} />
                <span className="text-xs font-bold" style={{ color: roleColor }}>Défini admin</span>
              </div>
            </motion.div>

            {/* Nombre de membres */}
            <motion.div
              className="mb-3 p-4 rounded-2xl bg-white border-2 flex items-center justify-between"
              style={{ borderColor: `${roleColor}30` }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5" style={{ color: roleColor }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre de membres</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <motion.span
                      className="font-black text-gray-900 text-2xl"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {totalMembres}
                    </motion.span>
                    <motion.div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 border border-green-300"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <ArrowUpRight className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-bold text-green-700">+{membresVariation} ce mois</span>
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">sur 500 max</p>
                <div className="w-16 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: roleColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalMembres / 500) * 100}%` }}
                    transition={{ delay: 0.6, duration: 1, type: 'spring' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Documents légaux */}
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-1">
                Documents légaux
              </p>
              <div className="flex flex-col gap-2">
                {legalDocuments.map((doc, idx) => {
                  const isValide = doc.status === 'valide';
                  return (
                    <motion.button
                      key={doc.id}
                      onClick={() => {
                        setShowLegalDocModal(doc.id);
                        speak(`Ouverture du document ${doc.label}`);
                      }}
                      className="w-full p-4 rounded-2xl bg-white border-2 flex items-center gap-3 text-left"
                      style={{ borderColor: isValide ? '#BBF7D0' : '#FED7AA' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isValide ? '#DCFCE7' : '#FEF3C7' }}
                      >
                        <FileText
                          className="w-5 h-5"
                          style={{ color: isValide ? '#16A34A' : '#D97706' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{doc.label}</p>
                        <p className="text-xs text-gray-500">{doc.numero}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isValide
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-orange-100 text-orange-700 border-orange-300'
                          }`}
                        >
                          {isValide ? 'Valide' : 'En attente'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bouton Déconnexion - Style Dashboard */}
        <motion.button
          onClick={handleLogout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-red-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-6 h-6" />
          Se déconnecter
        </motion.button>

        <PartenairesLogos />

      </div>

      <Navigation role="cooperative" />

      {/* Modal Fiche d'Identification */}
      <AnimatePresence>
        {showFicheIdentification && (
          <FicheIdentificationModal
            onClose={() => setShowFicheIdentification(false)}
            speak={speak}
            user={user}
            onSave={(updatedUser) => updateUser(updatedUser)}
          />
        )}
      </AnimatePresence>

      {/* Modal Info Personnelles */}
      <AnimatePresence>
        {showInfoPersonnelles && (
          <InfoPersonnellesModalUniversal
            onClose={() => setShowInfoPersonnelles(false)}
            speak={speak}
            roleColor={roleColor}
            user={user}
            onSave={(updatedData) => {
              updateUser({
                ...user,
                telephone: updatedData.telephone,
                email: updatedData.email,
                localisation: updatedData.localisation,
                typeActivite: updatedData.typeActivite,
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal Documents & Certifications */}
      <AnimatePresence>
        {showDocumentsCertifications && (
          <DocumentsCertificationsModalUniversal
            onClose={() => setShowDocumentsCertifications(false)}
            speak={speak}
            documents={documents}
            onDocumentClick={(documentType) => {
              setShowDocumentsCertifications(false);
              setShowDocumentModal(documentType);
            }}
            totalDocuments={totalDocuments}
            completedDocuments={completedDocuments}
            roleColor={roleColor}
          />
        )}
      </AnimatePresence>

      {/* Modals Documents */}
      <AnimatePresence>
        {showDocumentModal === 'carte-identite' && (
          <DocumentModal
            onClose={() => setShowDocumentModal(null)}
            speak={speak}
            document={documents['carte-identite']}
            icon={FileText}
            onUpdate={(updatedDoc) => handleUpdateDocument('carte-identite', updatedDoc)}
            totalDocuments={totalDocuments}
            completedDocuments={completedDocuments}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDocumentModal === 'certification-julaba' && (
          <DocumentModal
            onClose={() => setShowDocumentModal(null)}
            speak={speak}
            document={documents['certification-julaba']}
            icon={Shield}
            onUpdate={(updatedDoc) => handleUpdateDocument('certification-julaba', updatedDoc)}
            totalDocuments={totalDocuments}
            completedDocuments={completedDocuments}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDocumentModal === 'recepisse' && (
          <DocumentModal
            onClose={() => setShowDocumentModal(null)}
            speak={speak}
            document={documents['recepisse']}
            icon={FileText}
            onUpdate={(updatedDoc) => handleUpdateDocument('recepisse', updatedDoc)}
            totalDocuments={totalDocuments}
            completedDocuments={completedDocuments}
          />
        )}
      </AnimatePresence>

      {/* Modal Documents Légaux Coopérative */}
      <AnimatePresence>
        {showLegalDocModal && (() => {
          const doc = legalDocuments.find(d => d.id === showLegalDocModal);
          if (!doc) return null;
          const isValide = doc.status === 'valide';
          return (
            <motion.div
              key="legal-doc-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onClick={() => setShowLegalDocModal(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-lg bg-white rounded-t-[32px] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1.5 rounded-full bg-gray-300" />
                </div>

                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b-2"
                  style={{ borderColor: `${roleColor}20` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: isValide ? '#DCFCE7' : '#FEF3C7' }}
                    >
                      <FileText
                        className="w-5 h-5"
                        style={{ color: isValide ? '#16A34A' : '#D97706' }}
                      />
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 text-base">{doc.label}</h2>
                      <p className="text-xs text-gray-500">{doc.numero}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowLegalDocModal(null)}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>

                <div className="p-5 overflow-y-auto max-h-[70vh]">
                  {/* Badge statut */}
                  <div className="flex justify-center mb-5">
                    <motion.div
                      className={`flex items-center gap-2 px-5 py-2 rounded-full border-2 font-bold ${
                        isValide
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-orange-100 text-orange-700 border-orange-300'
                      }`}
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isValide
                        ? <CheckCircle className="w-4 h-4" />
                        : <AlertCircle className="w-4 h-4" />
                      }
                      <span>{isValide ? 'Document valide' : 'En attente de validation'}</span>
                    </motion.div>
                  </div>

                  {/* Photo du document */}
                  {doc.imageUrl ? (
                    <motion.div
                      className="mb-5 rounded-2xl overflow-hidden border-2 shadow-md"
                      style={{ borderColor: `${roleColor}30` }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <img
                        src={doc.imageUrl}
                        alt={doc.label}
                        className="w-full h-52 object-cover"
                      />
                      <div
                        className="px-4 py-2 flex items-center gap-2"
                        style={{ backgroundColor: `${roleColor}10` }}
                      >
                        <Camera className="w-4 h-4" style={{ color: roleColor }} />
                        <span className="text-xs font-bold text-gray-600">
                          Photo prise lors de l'enrôlement
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="mb-5 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center py-10 gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                        <Camera className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-500 text-center px-4">
                        Aucune photo disponible
                      </p>
                      <p className="text-xs text-gray-400 text-center px-6">
                        Ce document sera photographié lors de votre prochaine visite
                      </p>
                    </motion.div>
                  )}

                  {/* Informations du document */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Numéro</span>
                      <span className="text-sm font-black text-gray-900">{doc.numero}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Date d'émission</span>
                      <span className="text-sm font-black text-gray-900">{doc.dateEmission}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-start justify-between gap-4">
                      <span className="text-xs font-bold text-gray-500 flex-shrink-0">Délivré par</span>
                      <span className="text-sm font-black text-gray-900 text-right">{doc.delivrePar}</span>
                    </div>
                  </div>

                  {/* Note lecture seule */}
                  <div
                    className="mt-4 p-3 rounded-2xl flex items-center gap-3"
                    style={{ backgroundColor: `${roleColor}08`, border: `1.5px solid ${roleColor}25` }}
                  >
                    <Info className="w-4 h-4 flex-shrink-0" style={{ color: roleColor }} />
                    <p className="text-xs text-gray-600">
                      Ce document est en lecture seule. Pour toute modification, contactez l'administrateur JULABA.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}

// ========== COMPONENTS ==========

interface InfoFieldProps {
  icon: any;
  label: string;
  value: string;
}

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

interface StatCardProps {
  icon: any;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  borderColor: string;
  delay: number;
}

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
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </motion.div>
  );
}

interface DocumentCardProps {
  icon: any;
  label: string;
  status: string;
  statusColor: 'green' | 'blue' | 'orange' | 'red';
  date: string;
  onClick: () => void;
  roleColor: string;
}

function DocumentCard({ icon: Icon, label, status, statusColor, date, onClick, roleColor }: DocumentCardProps) {
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
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-6 h-6" style={{ color: roleColor }} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
          {status}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );
}