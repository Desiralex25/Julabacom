import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Calendar,
  Volume2,
  Edit,
  XCircle,
  ChevronDown,
  Package,
  Info,
  Leaf,
  ShoppingCart,
  Users,
  UserCheck,
  Clock,
  UserPlus,
  Sprout,
  BarChart3,
  LayoutDashboard,
  DollarSign,
  Settings,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
const tantieSagesseImg = '/images/tantie-sagesse.png';
import { RoleConfig } from '../../config/roleConfig';
import { CompactProfileCard } from './CompactProfileCard';
import { WalletCard } from '../wallet/WalletCard';
import { AcademyWidget } from '../academy/AcademyWidget';
import { ScoreResumeCard } from './ScoreResumeCard';
import { RoleType } from '../../config/roleConfig';
import { AlertesBanner, Alerte } from './AlertesBanner';

// Map des icônes disponibles
const ICONS_MAP: Record<string, any> = {
  TrendingUp,
  TrendingDown: TrendingUp,
  Leaf,
  ShoppingCart,
  Users,
  UserCheck,
  Clock,
  UserPlus,
  Sprout,
  Package,
  BarChart3,
  LayoutDashboard,
  DollarSign,
  Settings,
};

interface RoleDashboardProps {
  roleConfig: RoleConfig;
  role: RoleType; // Nouveau: role explicite pour les composants
  user: any;
  currentSession: any;
  stats: {
    kpi1Value: number;
    kpi2Value: number;
    caisse?: number;
  };
  isSpeaking: boolean;
  isJourneeExpanded: boolean;
  setIsJourneeExpanded: (expanded: boolean) => void;
  handleListenMessage: () => void;
  setShowOpenDayModal?: (show: boolean) => void;
  setShowEditFondModal?: (show: boolean) => void;
  setShowCloseDayModal?: (show: boolean) => void;
  setShowKPI1Modal?: (show: boolean) => void;
  setShowKPI2Modal?: (show: boolean) => void;
  setShowScoreModal?: (show: boolean) => void;
  setShowResumeModal?: (show: boolean) => void;
  setShowAction1Modal?: (show: boolean) => void;
  setShowAction2Modal?: (show: boolean) => void;
  speak: (text: string) => void;
  navigate: (path: string, options?: { state?: any }) => void;
  showCoachMark?: boolean;
  onDismissCoachMark?: () => void;
  customGreeting?: React.ReactNode;
  hasSessionManagement?: boolean;
  hideTantieSagesseImage?: boolean; // Nouvelle prop pour cacher l'image Tantie Sagesse
  showProfileCard?: boolean; // Nouvelle prop pour afficher la carte de profil compacte
  showWallet?: boolean; // Nouvelle prop pour afficher le wallet
  showAcademyWidget?: boolean; // Nouvelle prop pour afficher le widget Academy
  tantieSagesseImgSrc?: string;
  academyData?: {
    currentStreak: number;
    currentLevel: string;
    formationDuJour: {
      title: string;
      duration: number;
      points: number;
    };
  };
  onAcademyClick?: () => void;
  alertes?: Alerte[];  // Nouveau : alertes dynamiques
}

export function RoleDashboard({
  roleConfig,
  role,
  user,
  currentSession,
  stats,
  isSpeaking,
  isJourneeExpanded,
  setIsJourneeExpanded,
  handleListenMessage,
  setShowOpenDayModal,
  setShowEditFondModal,
  setShowCloseDayModal,
  setShowKPI1Modal,
  setShowKPI2Modal,
  setShowScoreModal,
  setShowResumeModal,
  speak,
  navigate,
  showCoachMark = false,
  onDismissCoachMark,
  setShowAction1Modal,
  setShowAction2Modal,
  customGreeting,
  hasSessionManagement = false,
  hideTantieSagesseImage = false,
  showProfileCard = false,
  showWallet = false,
  showAcademyWidget = false,
  tantieSagesseImgSrc,
  academyData,
  onAcademyClick,
  alertes = [],
}: RoleDashboardProps) {
  
  const primaryColor = roleConfig.primaryColor;
  const gradientFrom = roleConfig.gradientFrom;
  const gradientTo = roleConfig.gradientTo;

  // État pour le modal d'explication des boutons désactivés
  const [showDisabledModal, setShowDisabledModal] = React.useState(false);
  const [disabledMessage, setDisabledMessage] = React.useState('');

  // Fonction pour afficher le message explicatif
  const handleDisabledClick = (message: string) => {
    setDisabledMessage(message);
    setShowDisabledModal(true);
    speak(message);
  };

  // Icônes dynamiques
  const KPI1Icon = ICONS_MAP[roleConfig.dashboardKPIs.kpi1.icon] || TrendingUp;
  const KPI2Icon = ICONS_MAP[roleConfig.dashboardKPIs.kpi2.icon] || TrendingUp;
  const Action1Icon = ICONS_MAP[roleConfig.mainActions.action1.icon] || TrendingUp;
  const Action2Icon = ICONS_MAP[roleConfig.mainActions.action2.icon] || TrendingUp;

  // Calculer la "marge" (différence entre KPI1 et KPI2 pour certains rôles)
  const difference = stats.kpi1Value - stats.kpi2Value;

  // Ref Tantie Sagesse (image bounce)
  const tantieSagesseRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={`pb-32 lg:pb-8 pt-16 lg:pt-10 px-4 lg:pl-[320px] max-w-2xl lg:max-w-7xl mx-auto min-h-screen bg-gradient-to-b ${gradientFrom} ${gradientTo}`}>
      
      {/* Carte de profil compacte */}
      {showProfileCard && (
        <CompactProfileCard role={roleConfig.role} showScore={true} />
      )}

      {/* Bandeau d'alertes dynamiques */}
      {alertes.length > 0 && (
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <AlertesBanner alertes={alertes} role={role} />
        </motion.div>
      )}

      {/* Card Tantie Sagesse */}
      {!hideTantieSagesseImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-8"
        >
          <div className="flex items-stretch gap-2">
            {/* Image Tantie Sagesse à gauche */}
            <motion.div
              className="flex-shrink-0 flex items-center"
              animate={isSpeaking ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
            >
              <motion.img
                src={tantieSagesseImgSrc || tantieSagesseImg}
                alt="Tantie Sagesse"
                className="w-36 h-auto object-contain"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              />
            </motion.div>

            {/* Card contenu à droite */}
            <Card className="flex-1 px-4 py-3 rounded-3xl border-2 shadow-lg relative overflow-hidden" style={{ borderColor: primaryColor }}>
              {/* Fond animé */}
              <motion.div
                className="absolute inset-0 opacity-5"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}FF 0%, ${primaryColor}99 100%)`,
                  willChange: 'transform'
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative z-10 flex flex-col h-full gap-1">
                {/* Titre */}
                <motion.h3
                  className="font-black text-gray-900 leading-none"
                  style={{ fontSize: '20px' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  key={currentSession?.opened ? 'opened' : 'closed'}
                >
                  Tantie Sagesse
                </motion.h3>

                {/* Message */}
                <motion.p
                  className="text-gray-600 leading-snug flex-1"
                  style={{ fontSize: 'clamp(0.72rem, 2.2vw, 0.9rem)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  key={`message-${currentSession?.opened}`}
                >
                  {customGreeting || `Bonjour ${user?.firstName} ! ${roleConfig.greeting}`}
                </motion.p>

                {/* Bouton écouter — bas droite */}
                <div className="flex justify-end flex-shrink-0">
                  <motion.button
                    onClick={handleListenMessage}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                    whileHover={{ scale: 1.1, boxShadow: `0 8px 20px ${primaryColor}40` }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Card Ouvre ta journée / Journée ouverte - UNIQUEMENT pour Marchand */}
      {hasSessionManagement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <Card className={`mb-4 rounded-3xl shadow-md bg-gradient-to-br from-white ${gradientFrom} overflow-hidden`}>
            {currentSession ? (
              <>
                {/* Version compacte cliquable */}
                <motion.button
                  onClick={() => {
                    setIsJourneeExpanded(!isJourneeExpanded);
                    speak(isJourneeExpanded ? 'Journée réduite' : 'Détails de la journée');
                  }}
                  className={`w-full p-4 text-left flex items-center justify-between hover:bg-opacity-50`}
                  style={{ backgroundColor: isJourneeExpanded ? `${primaryColor}11` : 'transparent' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}22` }}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Journée ouverte</h3>
                      <p className="text-lg font-bold" style={{ color: primaryColor }}>
                        {currentSession.fondInitial.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isJourneeExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5" style={{ color: primaryColor }} />
                  </motion.div>
                </motion.button>

                {/* Contenu extensible */}
                <AnimatePresence>
                  {isJourneeExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-xs text-gray-500">
                          {new Date().toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEditFondModal?.(true);
                            }}
                            variant="outline"
                            className="flex-1 rounded-xl"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier le fond
                          </Button>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCloseDayModal?.(true);
                            }}
                            className="flex-1 rounded-xl text-white"
                            style={{ backgroundColor: '#DC2626' }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Fermer la caisse
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}22` }}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Calendar className="w-6 h-6" style={{ color: primaryColor }} />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-gray-900">Ouvre ta journée</h3>
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-10"
                >
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      speak('Combien tu as en caisse ce matin ?');
                      setShowOpenDayModal?.(true);
                    }}
                    className="w-full h-14 rounded-2xl text-lg font-bold text-white shadow-lg pointer-events-auto cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                    animate={{
                      boxShadow: [
                        `0 10px 40px ${primaryColor}33`,
                        `0 10px 60px ${primaryColor}55`,
                        `0 10px 40px ${primaryColor}33`,
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Animation de pulse continue */}
                    <motion.div
                      className="absolute inset-0"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                      animate={{
                        scale: [1, 1.5],
                        opacity: [0.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                    <span className="relative z-10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 inline mr-2" />
                      Ouvrir ma journée
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* CAISSE DIGITALE - Uniquement pour Marchand */}
      {roleConfig.name === 'Marchand' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.button
            onClick={() => {
              if (hasSessionManagement && !currentSession?.opened) {
                handleDisabledClick('Ouvre d\'abord ta journée avant d\'utiliser le terminal POS');
                return;
              }
              speak('Bienvenue sur le terminal de vente. Ajoute tes produits au panier');
              navigate('/marchand/caisse');
            }}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left"
          >
            <Card 
              className={`p-4 rounded-3xl border-2 ${
                hasSessionManagement && !currentSession?.opened
                  ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100' 
                  : `bg-gradient-to-br ${gradientFrom} via-white ${gradientTo}`
              }`}
              style={{ borderColor: hasSessionManagement && !currentSession?.opened ? '#9CA3AF' : primaryColor }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={!(hasSessionManagement && !currentSession?.opened) ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}
                    style={{ backgroundColor: hasSessionManagement && !currentSession?.opened ? '#E5E7EB' : `${primaryColor}22` }}
                  >
                    <svg 
                      className={`w-6 h-6 ${hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : ''}`}
                      style={{ color: hasSessionManagement && !currentSession?.opened ? undefined : primaryColor }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                      <path d="M9 9h.01M15 9h.01M9 15h6" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                  <div>
                    <p className={`font-bold text-[18px] mb-0.5 ${
                      hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      Caisse Digitale
                    </p>
                    <p className={`text-xs ${
                      hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Caisse digitale avec panier
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={!(hasSessionManagement && !currentSession?.opened) ? { x: [0, 5, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <svg 
                    className={`w-6 h-6 ${hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : ''}`}
                    style={{ color: hasSessionManagement && !currentSession?.opened ? undefined : primaryColor }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </Card>
          </motion.button>
        </motion.div>
      )}

      {/* WALLET - Juste après Caisse Digitale */}
      {showWallet && (
        <WalletCard 
          roleColor={primaryColor} 
          onNavigate={() => {
            speak('Ouverture de ton Wallet Jùlaba');
            navigate(`/${role}/wallet`);
          }}
        />
      )}

      {/* ACTIONS PRINCIPALES (2 colonnes) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Action 1 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => {
                if (hasSessionManagement && !currentSession?.opened) {
                  handleDisabledClick('Ouvre d\'abord ta journée avant de continuer');
                  return;
                }
                speak(roleConfig.mainActions.action1.subtitle);
                if (setShowAction1Modal) {
                  setShowAction1Modal(true);
                } else {
                  // Pour la coopérative, on navigue vers le marché avec la vue "achats"
                  if (role === 'cooperative') {
                    navigate(roleConfig.mainActions.action1.route, { state: { vue: 'achats' } });
                  } else {
                    navigate(roleConfig.mainActions.action1.route);
                  }
                }
              }}
              className="w-full text-left"
            >
              <Card 
                className={`p-3 rounded-3xl border-2 ${
                  hasSessionManagement && !currentSession?.opened
                    ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100' 
                    : 'bg-gradient-to-br from-green-50 via-white to-green-50'
                }`}
                style={{ borderColor: hasSessionManagement && !currentSession?.opened ? '#9CA3AF' : roleConfig.mainActions.action1.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`font-medium mb-0.5 font-bold text-[16px] ${
                      hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {roleConfig.mainActions.action1.label}
                    </p>
                    <p className={`text-xs ${
                      hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {roleConfig.mainActions.action1.subtitle}
                    </p>
                  </div>
                  <motion.div
                    animate={!(hasSessionManagement && !currentSession?.opened) ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
                    style={{ 
                      backgroundColor: hasSessionManagement && !currentSession?.opened 
                        ? '#E5E7EB' 
                        : `${roleConfig.mainActions.action1.color}22`
                    }}
                  >
                    <Action1Icon className={`w-5 h-5 ${
                      hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : ''
                    }`} style={{ color: hasSessionManagement && !currentSession?.opened ? undefined : roleConfig.mainActions.action1.color }} />
                  </motion.div>
                </div>
              </Card>
            </button>
          </motion.div>

          {/* Action 2 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => {
                if (hasSessionManagement && !currentSession?.opened) {
                  handleDisabledClick('Ouvre d\'abord ta journée avant de continuer');
                  return;
                }
                speak(roleConfig.mainActions.action2.subtitle);
                if (setShowAction2Modal) {
                  setShowAction2Modal(true);
                } else {
                  // Pour la coopérative, on navigue vers le marché avec la vue "ventes"
                  if (role === 'cooperative') {
                    navigate(roleConfig.mainActions.action2.route, { state: { vue: 'ventes' } });
                  } else {
                    navigate(roleConfig.mainActions.action2.route);
                  }
                }
              }}
              className="w-full text-left"
            >
              <Card 
                className={`p-3 rounded-3xl border-2 ${
                  hasSessionManagement && !currentSession?.opened
                    ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100' 
                    : `bg-gradient-to-br from-${roleConfig.mainActions.action2.color.includes('red') ? 'red' : 'blue'}-50 via-white to-${roleConfig.mainActions.action2.color.includes('red') ? 'red' : 'blue'}-50`
                }`}
                style={{ borderColor: hasSessionManagement && !currentSession?.opened ? '#9CA3AF' : roleConfig.mainActions.action2.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`font-medium mb-0.5 font-bold text-[16px] ${
                      hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {roleConfig.mainActions.action2.label}
                    </p>
                    <p className={`text-xs ${
                      hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {roleConfig.mainActions.action2.subtitle}
                    </p>
                  </div>
                  <motion.div
                    animate={!(hasSessionManagement && !currentSession?.opened) ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
                    style={{ 
                      backgroundColor: hasSessionManagement && !currentSession?.opened 
                        ? '#E5E7EB' 
                        : `${roleConfig.mainActions.action2.color}22`
                    }}
                  >
                    <Action2Icon className={`w-5 h-5 ${roleConfig.mainActions.action2.icon === 'TrendingDown' ? 'rotate-180' : ''} ${
                      hasSessionManagement && !currentSession?.opened ? 'text-gray-400' : ''
                    }`} style={{ color: hasSessionManagement && !currentSession?.opened ? undefined : roleConfig.mainActions.action2.color }} />
                  </motion.div>
                </div>
              </Card>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* 🆕 NOUVEAU: Score & Résumé du jour - Composant unifié avec toutes les améliorations UX */}
      <ScoreResumeCard
        score={user?.scoreCredit || 85}
        role={role}
        primaryColor={primaryColor}
        dailySummary={{
          ventes: stats.kpi1Value,
          depenses: stats.kpi2Value,
          caisse: stats.caisse || 0,
        }}
        speak={speak}
        onNavigateToAcademy={onAcademyClick}
      />

      {/* Coach Mark - Premier lancement (uniquement Marchand) */}
      {hasSessionManagement && (
        <AnimatePresence>
          {showCoachMark && !currentSession?.opened && (
            <>
              {/* Overlay sombre avec blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onDismissCoachMark}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
              />
              
              {/* Coach Mark Modal */}
              <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-full max-w-md pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white rounded-3xl shadow-2xl p-8 border-4" style={{ borderColor: primaryColor }}>
                    {/* Icône info avec animation */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}22` }}
                      >
                        <Info className="w-10 h-10" style={{ color: primaryColor }} />
                      </motion.div>
                    </div>

                    {/* Titre */}
                    <h3 className="text-2xl font-bold text-center mb-3 text-gray-900">
                      Premier pas
                    </h3>

                    {/* Message */}
                    <p className="text-center text-gray-600 text-base leading-relaxed mb-8">
                      Ouvre ta journée pour activer ta caisse
                    </p>

                    {/* Bouton J'ai compris */}
                    <motion.button
                      onClick={onDismissCoachMark}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      J'ai compris
                    </motion.button>
                  </div>

                  {/* Flèche animée pointant vers le bouton "Ouvrir ma journée" */}
                  <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="flex justify-center mt-8"
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <motion.path
                        d="M24 8 L24 40 M24 40 L14 30 M24 40 L34 30"
                        stroke={primaryColor}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{ 
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Modal d'explication des boutons désactivés */}
      <AnimatePresence>
        {showDisabledModal && (
          <>
            {/* Overlay sombre avec blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisabledModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-full max-w-md pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4" style={{ borderColor: primaryColor }}>
                  {/* Icône info avec animation */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}22` }}
                    >
                      <Info className="w-10 h-10" style={{ color: primaryColor }} />
                    </motion.div>
                  </div>

                  {/* Titre */}
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900">
                    Explication
                  </h3>

                  {/* Message */}
                  <p className="text-center text-gray-600 text-base leading-relaxed mb-8">
                    {disabledMessage}
                  </p>

                  {/* Bouton J'ai compris */}
                  <motion.button
                    onClick={() => setShowDisabledModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    J'ai compris
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Widget Academy */}
      {showAcademyWidget && academyData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <AcademyWidget
            role={roleConfig.role as any}
            currentStreak={academyData.currentStreak}
            currentLevel={academyData.currentLevel}
            formationDuJour={academyData.formationDuJour}
            onClick={onAcademyClick || (() => {})}
          />
        </motion.div>
      )}
    </div>
  );
}