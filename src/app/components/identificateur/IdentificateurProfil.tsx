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
  UserCheck,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { useIdentificateur } from '../../contexts/IdentificateurContext';
import { Navigation } from '../layout/Navigation';
import { Button } from '../ui/button';
import { Counter } from '../ui/counter';
import { InfoPersonnellesModalUniversal } from '../shared/InfoPersonnellesModalUniversal';
import { DocumentsCertificationsModalUniversal } from '../shared/DocumentsCertificationsModalUniversal';
import { SupportCardProfil } from '../shared/SupportCardProfil';
import { DocumentModal } from '../marchand/DocumentModal';
import { DocumentData, DocumentStatus, getStatusColor, getStatusLabel } from '../../types/document';
import QRCode from 'qrcode';
import { SimulateurBO } from '../shared/SimulateurBO';
import { PartenairesLogos } from '../shared/PartenairesLogos';

export function IdentificateurProfil() {
  const navigate = useNavigate();
  const { speak, setIsModalOpen } = useApp();
  const { user, updateUser, logout: userLogout } = useUser();
  const { getStatsIdentificateur } = useIdentificateur();
  
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

  const roleColor = '#9F8170';

  // Stats Identificateur
  const stats = getStatsIdentificateur(user?.telephone || 'ID001');

  // État des documents avec données complètes
  const [documents, setDocuments] = useState<{ [key: string]: DocumentData }>({
    'carte-identite': {
      id: 'doc-001',
      type: 'carte-identite',
      title: 'Carte d\'identité',
      status: 'verified' as DocumentStatus,
      imageUrl: 'https://images.unsplash.com/photo-1635231152740-dcfba853f33d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpZGVudGl0eSUyMGNhcmQlMjBkb2N1bWVudHxlbnwxfHx8fDE3NzIzNzQ1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
      title: 'Certification JULABA Identificateur',
      status: 'verified' as DocumentStatus,
      imageUrl: 'https://images.unsplash.com/photo-1637763723578-79a4ca9225f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNlcnRpZmljYXRlJTIwZG9jdW1lbnR8ZW58MXx8fHwxNzcyMzc0NTY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      uploadedAt: '2024-02-20T08:00:00Z',
      verifiedAt: '2024-02-20T14:00:00Z',
      verifiedBy: 'Aminata Touré - JULABA',
      rejectionReason: null,
      expirationDate: '2025-01-15',
      isLocked: false,
      details: {
        'Numéro de certification': 'CERT-JULABA-IDENT-2024-5678',
        'Date d\'obtention': '15 Jan 2024',
        'Date d\'expiration': '15 Jan 2025',
        'Niveau': 'Identificateur Certifié',
        'Score': '95/100',
        'Délivré par': 'JULABA CI - Siège National',
      },
    },
    'habilitation': {
      id: 'doc-003',
      type: 'habilitation',
      title: 'Habilitation',
      status: 'verified' as DocumentStatus,
      imageUrl: null,
      uploadedAt: null,
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
      expirationDate: null,
      isLocked: false,
      details: {
        'Numéro de demande': 'HAB-2024-9012',
        'Statut': 'Validé',
        'Zone d\'activité': user?.market || 'Marché de Cocody',
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
          role: 'identificateur',
          telephone: user.telephone,
        });
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: '#9F8170', light: '#FFFFFF' },
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
                           showDocumentModal !== null;
    setIsModalOpen(isAnyModalOpen);
  }, [showSettings, showDocuments, showLangue, showSecurityCode, showConfidentialite,
      showFicheIdentification, showInfoPersonnelles, showDocumentsCertifications,
      showDocumentModal, setIsModalOpen]);

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
      <div className="pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-stone-50 to-white">
        
        {/* 🎴 MA CARTE PROFESSIONNELLE - Style Moderne avec Flip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          {/* Header avec boutons actions */}
          <div className="flex items-center justify-center mb-3">
            {/* Bouton Afficher/Masquer */}
            <motion.button
              onClick={() => {
                setShowProfessionalCard(!showProfessionalCard);
                speak(showProfessionalCard ? 'Carte masquée' : 'Carte affichée');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg text-white"
              style={{ backgroundColor: roleColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CreditCard className="w-4 h-4" />
              {showProfessionalCard ? 'Masquer ma carte professionnelle' : 'Afficher ma carte professionnelle'}
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
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-stone-50/80 via-white to-stone-50/80"
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
                            navigate('/identificateur/parametres');
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
                            style={{ borderColor: roleColor, backgroundColor: '#FAF8F5' }}
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
                          <p className="text-xs font-bold text-gray-500 mb-1">IDENTIFICATEUR AGRÉÉ</p>
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
                        <InfoField icon={Calendar} label="Date de naissance" value={user.dateNaissance || '01/01/1990'} />
                        <InfoField icon={Globe} label="Nationalité" value={user.nationalite || 'Ivoirienne'} />
                        <InfoField icon={FileText} label="N° CNI" value={user.cni || 'CI2024******'} />
                        <InfoField icon={Shield} label="N° CMU" value={user.cmu || 'CMU2024******'} />
                      </div>

                      {/* Zone d'activité */}
                      <div className="p-4 rounded-[20px] bg-gradient-to-r from-amber-100/50 to-yellow-100/50 border-2" style={{ borderColor: `${roleColor}40` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" style={{ color: roleColor }} />
                          <p className="text-xs font-bold text-gray-600">Zone d'activité</p>
                        </div>
                        <p className="text-sm font-black text-gray-900">{user.market || 'Marché de Cocody'}</p>
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
                    className="rounded-[32px] p-6 border-[3px] shadow-2xl relative overflow-hidden bg-gradient-to-br from-stone-50/80 via-white to-stone-50/80"
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
                        <InfoField icon={Mail} label="Email" value={user.email || 'identificateur@julaba.ci'} />
                      </div>

                      {/* Stats Identificateur */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-[16px] bg-blue-100/50 border-2 border-blue-200">
                          <p className="text-xs font-bold text-gray-600 mb-1">Identifications</p>
                          <p className="text-lg font-black text-blue-600">{stats.totalIdentifications}</p>
                        </div>
                        <div className="p-3 rounded-[16px] bg-green-100/50 border-2 border-green-200">
                          <p className="text-xs font-bold text-gray-600 mb-1">Taux validation</p>
                          <p className="text-lg font-black text-green-600">{stats.tauxValidation.toFixed(0)}%</p>
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
                className="p-8 rounded-[32px] bg-gradient-to-br from-stone-50 via-white to-stone-50 border-[3px] shadow-lg text-center"
                style={{ borderColor: roleColor }}
              >
                <motion.div
                  className="flex flex-col items-center gap-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center shadow-lg border-[3px]" style={{ borderColor: roleColor }}>
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
              navigate('/identificateur/academy');
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-stone-50 via-white to-stone-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: `${roleColor}40` }}
            whileHover={{ scale: 1.02, borderColor: roleColor }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
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

        {/* Fiche d'identification - Juste sous la carte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <DocumentCard
            icon={FileText}
            label="Fiche d'identification JULABA"
            status="Complété"
            statusColor="green"
            date={new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            onClick={() => {
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
            {/* Total Identifications */}
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-md"
              style={{ borderColor: '#2072AF' }}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(32, 114, 175, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Identifications
                  </p>
                  <p className="text-xs text-gray-600">Total enrôlées</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100"
                >
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.totalIdentifications}</p>
            </motion.div>

            {/* Taux de validation */}
            <motion.div
              className="p-3 rounded-3xl border-2 bg-gradient-to-br from-green-50 via-white to-green-50 shadow-md"
              style={{ borderColor: '#16A34A' }}
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(22, 163, 74, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium mb-0.5 font-bold text-sm md:text-base text-gray-600">
                    Taux validation
                  </p>
                  <p className="text-xs text-gray-600">Identifications validées</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.tauxValidation.toFixed(0)}%</p>
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
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-stone-50 via-white to-stone-50 border-2 shadow-md flex items-center justify-between"
            style={{ borderColor: `${roleColor}40` }}
            whileHover={{ scale: 1.02, borderColor: roleColor }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
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

        {/* Activité du mois - Style Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Activité du mois</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Total identifications */}
            <StatCard
              icon={Users}
              label="Identifications"
              value={`${stats.totalIdentifications}`}
              color={roleColor}
              bgColor="from-stone-50 via-white to-stone-50"
              borderColor="border-stone-200"
              delay={0.1}
            />
            <StatCard
              icon={CheckCircle}
              label="Validées"
              value={`${stats.identificationsValidees}`}
              color="#16A34A"
              bgColor="from-green-50 via-white to-green-50"
              borderColor="border-green-200"
              delay={0.2}
            />
            <StatCard
              icon={BarChart3}
              label="En cours"
              value={`${stats.identificationsEnCours}`}
              color="#F59E0B"
              bgColor="from-orange-50 via-white to-orange-50"
              borderColor="border-orange-200"
              delay={0.3}
            />
            <StatCard
              icon={Target}
              label="Taux validation"
              value={`${stats.tauxValidation.toFixed(0)}%`}
              color="#2072AF"
              bgColor="from-blue-50 via-white to-blue-50"
              borderColor="border-blue-200"
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
        <SupportCardProfil role="identificateur" delay={0.45} />

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

      <Navigation role="identificateur" />

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
        {showDocumentModal === 'habilitation' && (
          <DocumentModal
            onClose={() => setShowDocumentModal(null)}
            speak={speak}
            document={documents['habilitation']}
            icon={FileText}
            onUpdate={(updatedDoc) => handleUpdateDocument('habilitation', updatedDoc)}
            totalDocuments={totalDocuments}
            completedDocuments={completedDocuments}
          />
        )}
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
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-bold text-gray-900">{value}</p>
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
          <Icon className="w-6 h-6" style={{ color: '#9F8170' }} />
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