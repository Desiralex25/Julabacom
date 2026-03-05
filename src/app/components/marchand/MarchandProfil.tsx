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
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCaisse } from '../../contexts/CaisseContext';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { DocumentModal } from './DocumentModal';
import { Navigation } from '../layout/Navigation';
import { Button } from '../ui/button';
import { Counter } from '../ui/counter';
import { SecurityCodeModal } from './SecurityCodeModal';
import { FicheIdentificationModal } from './FicheIdentificationModal';
import { InfoPersonnellesModalUniversal } from '../shared/InfoPersonnellesModalUniversal';
import { DocumentsCertificationsModalUniversal } from '../shared/DocumentsCertificationsModalUniversal';
import { SupportCardProfil } from '../shared/SupportCardProfil';
import { IdentificationInfoBadge } from '../shared/IdentificationInfoBadge';
import { NotificationsPanel, NotifBellButton } from '../shared/NotificationsPanel';
import { DocumentData, DocumentStatus, getStatusColor, getStatusLabel } from '../../types/document';
import QRCode from 'qrcode';
import { PartenairesLogos } from '../shared/PartenairesLogos';


export function MarchandProfil() {
  const navigate = useNavigate();
  const { stats, transactions } = useCaisse();
  const { speak, setIsModalOpen } = useApp();
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
  const [showNotifications, setShowNotifications] = useState(false);

  // État des documents avec données complètes
  const [documents, setDocuments] = useState<{ [key: string]: DocumentData }>({
    'carte-identite': {
      id: 'doc-001',
      type: 'carte-identite',
      title: 'Carte d\'identité',
      status: 'verified' as DocumentStatus,
      imageUrl: '/images/doc-cni.png',
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
      title: 'Certification JULABA',
      status: 'rejected' as DocumentStatus,
      imageUrl: '/images/doc-certificat.png',
      uploadedAt: '2024-02-20T08:00:00Z',
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: 'Photo floue - Veuillez reprendre une photo nette avec un bon éclairage',
      expirationDate: '2025-01-15',
      isLocked: false,
      details: {
        'Numéro de certification': 'CERT-JULABA-2024-5678',
        'Date d\'obtention': '15 Jan 2024',
        'Date d\'expiration': '15 Jan 2025',
        'Niveau': 'Marchand Certifié Premium',
        'Score': '98/100',
        'Délivré par': 'JULABA CI - Siège National',
      },
    },
    'attestation-activite': {
      id: 'doc-003',
      type: 'attestation-activite',
      title: 'Attestation d\'activité',
      status: 'empty' as DocumentStatus,
      imageUrl: null,
      uploadedAt: null,
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
      expirationDate: null,
      isLocked: false,
      details: {
        'Numéro de demande': 'ATT-2024-9012',
        'Statut': 'À compléter',
        'Type d\'activité': 'Commerce produits vivriers',
        'Zone d\'activité': 'Marché d\'Adjamé',
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
          id: user.numeroMarchand,
          nom: `${user.prenoms} ${user.nom}`,
          role: 'marchand',
          telephone: user.telephone,
        });
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: '#C46210', light: '#FFFFFF' },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Erreur génération QR Code:', err);
      }
    };
    if (user) generateQR();
  }, [user]);

  // Gérer l'affichage de la bottom bar selon l'état des modals
  React.useEffect(() => {
    const isAnyModalOpen = showSettings || showDocuments || showLangue || 
                           showSecurityCode || showConfidentialite || 
                           showFicheIdentification ||
                           showInfoPersonnelles || showDocumentsCertifications ||
                           showDocumentModal !== null || showNotifications;
    setIsModalOpen(isAnyModalOpen);
  }, [showSettings, showDocuments, showLangue, showSecurityCode, showConfidentialite,
      showFicheIdentification, showInfoPersonnelles, showDocumentsCertifications,
      showDocumentModal, showNotifications, setIsModalOpen]);

  const handleLogout = () => {
    speak('Déconnexion en cours');
    userLogout();
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  if (!user) return null;

  const marge = (stats?.ventes || 0) - (stats?.depenses || 0);
  const totalVentes = transactions.filter((t) => t.type === 'vente').length;
  const totalDepenses = transactions.filter((t) => t.type === 'depense').length;

  return (
    <>
      <div className="pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-orange-50 to-white">
        
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
              style={{ backgroundColor: '#C46210' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CreditCard className="w-4 h-4" />
              {showProfessionalCard ? 'Masquer ma carte' : 'Afficher ma carte'}
            </motion.button>
            {/* Bouton Réglages */}
            <motion.button
              onClick={() => navigate('/marchand/parametres')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm shadow-sm border-2"
              style={{ borderColor: '#C46210', color: '#C46210', backgroundColor: 'rgba(196,98,16,0.06)' }}
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
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-orange-50/80 via-white to-orange-50/80"
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
                      style={{ width: '50%', borderColor: '#C46210' }}
                    />

                    <div className="relative z-10">
                      {/* En-t��te avec logo et bouton paramètres */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white border-[3px] flex items-center justify-center shadow-lg" style={{ borderColor: '#C46210' }}>
                            <Shield className="w-6 h-6" style={{ color: '#C46210' }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-600 tracking-widest">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
                            <p className="text-lg font-black" style={{ color: '#C46210' }}>JULABA</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            speak('Ouverture des paramètres');
                            navigate('/marchand/parametres');
                          }}
                          className="w-12 h-12 rounded-xl bg-white shadow-lg border-[3px] flex items-center justify-center"
                          style={{ borderColor: '#C46210' }}
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Settings className="w-5 h-5" style={{ color: '#C46210' }} />
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
                            style={{ borderColor: '#C46210', backgroundColor: '#FFF5E6' }}
                          >
                            {user.photo ? (
                              <img src={user.photo} alt={`${user.prenoms} ${user.nom}`} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-14 h-14" style={{ color: '#C46210' }} strokeWidth={2.5} />
                            )}
                          </div>
                          <motion.button
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-[3px]"
                            style={{ borderColor: '#C46210' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              speak('Modifier la photo');
                            }}
                            whileHover={{ scale: 1.15, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Camera className="w-5 h-5" style={{ color: '#C46210' }} />
                          </motion.button>
                        </motion.div>

                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 mb-1">MARCHAND AGRÉÉ</p>
                          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">
                            {user.prenoms}
                            <br />
                            {user.nom}
                          </h1>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4" style={{ color: '#C46210' }} />
                            <p className="text-sm font-bold text-gray-700">{user.numeroMarchand}</p>
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
                        <InfoField icon={Calendar} label="Date de naissance" value={user.dateNaissance || '01/01/1990'} />
                        <InfoField icon={Globe} label="Nationalité" value={user.nationalite || 'Ivoirienne'} />
                        <InfoField icon={FileText} label="N° CNI" value={user.cni || 'CI2024******'} />
                        <InfoField icon={Shield} label="N° CMU" value={user.cmu || 'CMU2024******'} />
                      </div>

                      {/* RSTI */}
                      <div className="p-4 rounded-[20px] bg-gradient-to-r from-orange-100/50 to-yellow-100/50 border-2 border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4" style={{ color: '#C46210' }} />
                          <p className="text-xs font-bold text-gray-600">N° RSTI</p>
                        </div>
                        <p className="text-sm font-black text-gray-900">{user.rsti || 'RSTI2024******'}</p>
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
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-orange-50/80 via-white to-orange-50/80"
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
                      style={{ width: '50%', borderColor: '#C46210' }}
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
                          <div className="w-28 h-28 rounded-[16px] border-[3px] p-2 bg-white shadow-lg" style={{ borderColor: '#C46210' }}>
                            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-600 mb-2">Score JULABA</p>
                          <motion.p
                            className="text-5xl font-black"
                            style={{ color: '#C46210' }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Counter value={user.scoreCredit} duration={1500} />
                          </motion.p>
                        </div>
                      </div>

                      {/* Infos pro - Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <InfoField icon={MapPin} label="Marché" value={user.localisation} />
                        <InfoField icon={Building2} label="Commune" value={user.commune || 'Abidjan'} />
                        <InfoField icon={Phone} label="Téléphone" value={user.telephone} />
                        <InfoField icon={Mail} label="Email" value={user.email || 'marchand@julaba.ci'} />
                      </div>

                      {/* Récépissé */}
                      <div className="p-4 rounded-[20px] bg-gradient-to-r from-blue-100/50 to-indigo-100/50 border-2 border-blue-200 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-bold text-gray-600">Récépissé</p>
                        </div>
                        <p className="text-sm font-black text-gray-900">{user.recepisse || 'N01673/PA/SG/D1'}</p>
                      </div>

                      {/* Catégorie + Boîte postale */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-[16px] bg-purple-100/50 border-2 border-purple-200">
                          <p className="text-xs font-bold text-gray-600 mb-1">Catégorie</p>
                          <p className="text-lg font-black" style={{ color: '#702963' }}>{user.categorie || 'A'}</p>
                        </div>
                        <div className="p-3 rounded-[16px] bg-gray-100 border-2 border-gray-200">
                          <p className="text-xs font-bold text-gray-600 mb-1">Boîte postale</p>
                          <p className="text-xs font-bold text-gray-900">{user.boitePostale || '31 BP 573'}</p>
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
                className="p-8 rounded-[32px] bg-gradient-to-br from-orange-50 via-white to-orange-50 border-[3px] border-orange-200 shadow-lg text-center"
                style={{ borderColor: '#C46210' }}
              >
                <motion.div
                  className="flex flex-col items-center gap-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center shadow-lg border-[3px]" style={{ borderColor: '#C46210' }}>
                    <CreditCard className="w-10 h-10" style={{ color: '#C46210' }} />
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
              navigate('/marchand/academy');
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-orange-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: '#C4621040' }}
            whileHover={{ scale: 1.02, borderColor: '#C46210' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" style={{ color: '#C46210' }} />
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
              navigate('/marchand/wallet');
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-orange-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: '#C4621040' }}
            whileHover={{ scale: 1.02, borderColor: '#C46210' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Wallet className="w-6 h-6" style={{ color: '#C46210' }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Mon Wallet</h3>
                <p className="text-xs text-gray-500">Solde, recharge, historique</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Fiche d'identification JULABA - Badge dynamique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <IdentificationInfoBadge
            numeroFiche={user.numeroMarchand || 'MARCH-2026-0001'}
            nomAgent={user.nomAgent || 'BAMBA'}
            prenomAgent={user.prenomAgent || 'Issa'}
            dateIdentification={user.dateIdentification || '2026-02-10T09:30:00Z'}
            statut={(user.statutIdentification as any) || 'valide'}
            raisonsRejet={user.raisonsRejetIdentification}
            accentColor="#C46210"
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
            {/* Total Ventes */}
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-green-50 via-white to-green-50 shadow-md"
              style={{ borderColor: '#16A34A' }}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(22, 163, 74, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Ventes
                  </p>
                  <p className="text-xs text-gray-600">Total réalisées</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100"
                >
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-green-600">{totalVentes}</p>
            </motion.div>

            {/* Total Dépenses */}
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-red-50 via-white to-red-50 shadow-md"
              style={{ borderColor: '#DC2626' }}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(220, 38, 38, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Dépenses
                  </p>
                  <p className="text-xs text-gray-600">Total effectuées</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100"
                >
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-red-600">{totalDepenses}</p>
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
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-orange-50 border-2 border-orange-200 shadow-md flex items-center justify-between"
            whileHover={{ scale: 1.02, borderColor: '#C46210' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <User className="w-6 h-6" style={{ color: '#C46210' }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
                <p className="text-xs text-gray-500">Gérer mes coordonnées</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Activité du jour - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Activité du jour</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Ventes du jour */}
            <StatCard
              icon={TrendingUp}
              label="Ventes"
              value={`${(stats?.ventes || 0).toLocaleString('fr-FR')} FCFA`}
              color="#00563B"
              bgColor="from-green-50 via-white to-green-50"
              borderColor="border-green-200"
              delay={0.1}
            />
            <StatCard
              icon={Wallet}
              label="Dépenses"
              value={`${(stats?.depenses || 0).toLocaleString('fr-FR')} FCFA`}
              color="#DC2626"
              bgColor="from-red-50 via-white to-red-50"
              borderColor="border-red-200"
              delay={0.2}
            />
            <StatCard
              icon={CreditCard}
              label="Caisse"
              value={`${(stats?.caisse || 0).toLocaleString('fr-FR')} FCFA`}
              color="#2072AF"
              bgColor="from-blue-50 via-white to-blue-50"
              borderColor="border-blue-200"
              delay={0.3}
            />
            <StatCard
              icon={Target}
              label="Bénéfice"
              value={`${marge.toLocaleString('fr-FR')} FCFA`}
              color="#C46210"
              bgColor="from-orange-50 via-white to-orange-50"
              borderColor="border-orange-300"
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Documents & Certifications - Modal Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => {
              setShowDocumentsCertifications(true);
              speak('Ouverture des documents et certifications');
            }}
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
                <p className="text-xs text-gray-500">Gérer mes documents officiels</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </motion.div>

        {/* Support & Aide */}
        <SupportCardProfil role="marchand" delay={0.45} />

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
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm hover:border-[#C46210]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="w-6 h-6" style={{ color: '#C46210' }} />
              <p className="font-bold text-sm text-gray-900">Notifications</p>
            </motion.button>

            <motion.button
              onClick={() => {
                setShowSecurityCode(true);
                speak('Changer le mot de passe');
              }}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm hover:border-[#C46210]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock className="w-6 h-6" style={{ color: '#C46210' }} />
              <p className="font-bold text-sm text-gray-900">Sécurité</p>
            </motion.button>

            <motion.button
              onClick={() => setShowSettings(true)}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm hover:border-[#C46210]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Volume2 className="w-6 h-6" style={{ color: '#C46210' }} />
              <p className="font-bold text-sm text-gray-900">Assistance</p>
            </motion.button>

            <motion.button
              onClick={() => {
                setShowLangue(true);
                speak('Langue et région');
              }}
              className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex flex-col items-start gap-2 shadow-sm hover:border-[#C46210]"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="w-6 h-6" style={{ color: '#C46210' }} />
              <p className="font-bold text-sm text-gray-900">Langue</p>
            </motion.button>
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

      <Navigation role="marchand" />

      {/* Modal Settings */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)} 
            speak={speak}
            onShowLangue={() => setShowLangue(true)}
            onShowPIN={() => setShowSecurityCode(true)}
            onShowConfidentialite={() => setShowConfidentialite(true)}
          />
        )}
      </AnimatePresence>

      {/* Modal Documents */}
      <AnimatePresence>
        {showDocuments && (
          <DocumentsModal onClose={() => setShowDocuments(false)} speak={speak} />
        )}
      </AnimatePresence>

      {/* Modal Langue */}
      <AnimatePresence>
        {showLangue && (
          <LangueModal onClose={() => setShowLangue(false)} speak={speak} />
        )}
      </AnimatePresence>

      {/* Modal PIN */}
      <AnimatePresence>
        {showSecurityCode && (
          <SecurityCodeModal onClose={() => setShowSecurityCode(false)} speak={speak} />
        )}
      </AnimatePresence>

      {/* Modal Confidentialité */}
      <AnimatePresence>
        {showConfidentialite && (
          <ConfidentialiteModal onClose={() => setShowConfidentialite(false)} speak={speak} />
        )}
      </AnimatePresence>

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
            roleColor="#C46210"
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
            roleColor="#C46210"
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
        {showDocumentModal === 'attestation-activite' && (
          <DocumentModal
            onClose={() => setShowDocumentModal(null)}
            speak={speak}
            document={documents['attestation-activite']}
            icon={FileText}
            onUpdate={(updatedDoc) => handleUpdateDocument('attestation-activite', updatedDoc)}
            totalDocuments={totalDocuments}
            completedDocuments={completedDocuments}
          />
        )}
      </AnimatePresence>

      {/* Panel Notifications */}
      <NotificationsPanel
        userId={user.id}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        accentColor="#C46210"
      />
    </>
  );
}

// ========== COMPONENTS ==========

interface InfoCardProps {
  icon: any;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  color: string;
  isIdentifier?: boolean;
}

function InfoCard({ icon: Icon, label, value, isEditing, onChange, color, isIdentifier }: InfoCardProps) {
  return (
    <motion.div
      className="p-4 rounded-3xl bg-gradient-to-br from-orange-50 via-white to-orange-50 border-2 border-gray-200 shadow-md"
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(196, 98, 16, 0.15)' }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <p className="text-sm font-semibold text-gray-600">{label}</p>
      </div>
      {isEditing ? (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-[#C46210] focus:outline-none font-bold text-gray-900"
          />
          {isIdentifier && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-900">Identifiant de connexion par OTP</p>
                <p className="text-xs text-blue-700 mt-1">
                  Ce numéro est votre identifiant unique. Une fois modifié, il deviendra votre nouveau identifiant de connexion.
                </p>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <>
          <p className="text-lg font-bold text-gray-900 ml-[52px]">{value}</p>
          {isIdentifier && (
            <div className="mt-2 ml-[52px] flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-600" />
              <p className="text-xs text-blue-700 font-semibold">Identifiant de connexion OTP</p>
            </div>
          )}
        </>
      )}
    </motion.div>
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
}

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
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-6 h-6" style={{ color: '#C46210' }} />
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

// ========== SETTINGS MODAL ==========
interface SettingsModalProps {
  onClose: () => void;
  speak: (text: string) => void;
  onShowLangue: () => void;
  onShowPIN: () => void;
  onShowConfidentialite: () => void;
}

function SettingsModal({ onClose, speak, onShowLangue, onShowPIN, onShowConfidentialite }: SettingsModalProps) {
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Notifications */}
          <SettingToggle
            icon={Bell}
            label="Notifications"
            value={notifications}
            onChange={(val) => {
              setNotifications(val);
              speak(val ? 'Notifications activées' : 'Notifications désactivées');
            }}
          />

          {/* Voice */}
          <SettingToggle
            icon={Volume2}
            label="Assistant vocal"
            value={voice}
            onChange={(val) => {
              setVoice(val);
              speak(val ? 'Assistant vocal activé' : 'Assistant vocal désactivé');
            }}
          />

          {/* Dark Mode */}
          <SettingToggle
            icon={Moon}
            label="Mode sombre"
            value={darkMode}
            onChange={(val) => {
              setDarkMode(val);
              speak(val ? 'Mode sombre activé' : 'Mode clair activé');
            }}
          />

          {/* Langue */}
          <SettingButton
            icon={Globe}
            label="Langue"
            value="Français"
            onClick={() => {
              onShowLangue();
              speak('Sélection de la langue');
            }}
          />

          {/* Sécurité */}
          <SettingButton
            icon={Lock}
            label="Changer le mot de passe"
            onClick={() => {
              onShowPIN();
              speak('Modification du mot de passe');
            }}
          />

          {/* Confidentialité */}
          <SettingButton
            icon={Shield}
            label="Confidentialité"
            onClick={() => {
              onShowConfidentialite();
              speak('Paramètres de confidentialité');
            }}
          />
        </div>

        {/* Version */}
        <div className="px-6 pb-6 text-center text-sm text-gray-500">
          <p>JULABA v1.0.0</p>
          <p className="text-xs mt-1">Plateforme nationale d'inclusion économique 🇨🇮</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface SettingToggleProps {
  icon: any;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function SettingToggle({ icon: Icon, label, value, onChange }: SettingToggleProps) {
  return (
    <motion.div
      className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-gray-200"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color: '#C46210' }} />
        </div>
        <p className="font-semibold text-gray-900">{label}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition-colors ${
          value ? 'bg-[#C46210]' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: value ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}

interface SettingButtonProps {
  icon: any;
  label: string;
  value?: string;
  onClick: () => void;
}

function SettingButton({ icon: Icon, label, value, onClick }: SettingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-gray-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color: '#C46210' }} />
        </div>
        <p className="font-semibold text-gray-900">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-gray-500">{value}</span>}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.button>
  );
}

// ========== INFO FIELD COMPONENT ==========
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
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-black text-gray-900 truncate">{value}</p>
    </div>
  );
}

// ========== DOCUMENTS MODAL ==========
interface DocumentsModalProps {
  onClose: () => void;
  speak: (text: string) => void;
}

function DocumentsModal({ onClose, speak }: DocumentsModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-900">Documents & Certifications</h2>
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Carte d'identité */}
          <DocumentDetail
            icon={FileText}
            label="Carte d'identité"
            status="Vérifié"
            statusColor="green"
            date="15 Jan 2024"
            description="La carte d'identité a été vérifiée avec succès."
          />

          {/* Certification JULABA */}
          <DocumentDetail
            icon={Shield}
            label="Certification JULABA"
            status="Validé"
            statusColor="blue"
            date="15 Jan 2024"
            description="La certification JULABA a été validée avec succès."
          />

          {/* Attestation d'activité */}
          <DocumentDetail
            icon={FileText}
            label="Attestation d'activité"
            status="En attente"
            statusColor="orange"
            date="20 Fév 2024"
            description="L'attestation d'activité est en attente de validation."
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

interface DocumentDetailProps {
  icon: any;
  label: string;
  status: string;
  statusColor: 'green' | 'blue' | 'orange' | 'red';
  date: string;
  description: string;
}

function DocumentDetail({ icon: Icon, label, status, statusColor, date, description }: DocumentDetailProps) {
  const statusColors = {
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  };

  const colors = statusColors[statusColor];

  return (
    <motion.div
      className="p-4 rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 border-gray-200 shadow-md flex items-center justify-between"
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-6 h-6" style={{ color: '#C46210' }} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500">{date}</p>
          <p className="text-sm text-gray-700 mt-2">{description}</p>
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

// ========== LANGUE MODAL ==========
interface LangueModalProps {
  onClose: () => void;
  speak: (text: string) => void;
}

function LangueModal({ onClose, speak }: LangueModalProps) {
  const [langue, setLangue] = useState('Français');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-900">Langue et région</h2>
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Langue */}
          <SettingButton
            icon={Globe}
            label="Langue"
            value={langue}
            onClick={() => {
              setLangue(langue === 'Français' ? 'Anglais' : 'Français');
              speak(`Langue changée en ${langue === 'Français' ? 'Anglais' : 'Français'}`);
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== PIN MODAL ==========
interface PINModalProps {
  onClose: () => void;
  speak: (text: string) => void;
}

function PINModal({ onClose, speak }: PINModalProps) {
  const [step, setStep] = useState<'verify' | 'change'>('verify');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleVerifyOldPassword = () => {
    if (!oldPassword) {
      setError('Veuillez entrer votre ancien mot de passe');
      speak('Veuillez entrer votre ancien mot de passe');
      return;
    }
    // Validation différée côté Supabase Auth — passage direct en attendant l'intégration backend
    setError('');
    setStep('change');
    speak('Vous pouvez maintenant entrer votre nouveau mot de passe');
  };

  const handleSaveNewPassword = () => {
    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      speak('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      speak('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      speak('Les mots de passe ne correspondent pas');
      return;
    }

    // Succès
    setError('');
    speak('Mot de passe modifié avec succès');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'verify' ? 'Vérification du mot de passe' : 'Nouveau mot de passe'}
          </h2>
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'verify' ? (
            <>
              {/* Étape 1 : Vérifier l'ancien mot de passe */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ancien mot de passe</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" style={{ color: '#C46210' }} />
                  </div>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Entrez votre ancien mot de passe"
                    className="flex-1 p-2 rounded-xl border-0 focus:outline-none font-bold text-gray-900"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyOldPassword()}
                  />
                </div>
                <p className="text-xs text-gray-500 px-2">
                  Pour des raisons de sécurité, veuillez d'abord confirmer votre ancien mot de passe
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Bouton Vérifier */}
              <motion.button
                onClick={handleVerifyOldPassword}
                className="w-full py-4 rounded-2xl text-lg font-bold text-white shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#C46210' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle className="w-6 h-6" />
                Vérifier
              </motion.button>
            </>
          ) : (
            <>
              {/* Étape 2 : Entrer le nouveau mot de passe */}
              
              {/* Message de succès */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-green-50 border-2 border-green-200 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-700">
                  Ancien mot de passe validé ✓
                </p>
              </motion.div>

              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" style={{ color: '#C46210' }} />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrez le nouveau mot de passe"
                    className="flex-1 p-2 rounded-xl border-0 focus:outline-none font-bold text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 px-2">
                  Minimum 6 caractères
                </p>
              </div>

              {/* Confirmer le mot de passe */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" style={{ color: '#C46210' }} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez le nouveau mot de passe"
                    className="flex-1 p-2 rounded-xl border-0 focus:outline-none font-bold text-gray-900"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveNewPassword()}
                  />
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Bouton Enregistrer */}
              <motion.button
                onClick={handleSaveNewPassword}
                className="w-full py-4 rounded-2xl text-lg font-bold text-white shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#00563B' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle className="w-6 h-6" />
                Enregistrer
              </motion.button>

              {/* Bouton Retour */}
              <motion.button
                onClick={() => {
                  setStep('verify');
                  setError('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-600 border-2 border-gray-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Retour
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ========== CONFIDENTIALITE MODAL ==========
interface ConfidentialiteModalProps {
  onClose: () => void;
  speak: (text: string) => void;
}

function ConfidentialiteModal({ onClose, speak }: ConfidentialiteModalProps) {
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end px-4 pb-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-bold text-gray-900">Paramètres de confidentialité</h2>
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Notifications */}
          <SettingToggle
            icon={Bell}
            label="Notifications"
            value={notifications}
            onChange={(val) => {
              setNotifications(val);
              speak(val ? 'Notifications activées' : 'Notifications désactivées');
            }}
          />

          {/* Voice */}
          <SettingToggle
            icon={Volume2}
            label="Assistant vocal"
            value={voice}
            onChange={(val) => {
              setVoice(val);
              speak(val ? 'Assistant vocal activé' : 'Assistant vocal désactivé');
            }}
          />

          {/* Dark Mode */}
          <SettingToggle
            icon={Moon}
            label="Mode sombre"
            value={darkMode}
            onChange={(val) => {
              setDarkMode(val);
              speak(val ? 'Mode sombre activé' : 'Mode clair activé');
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}