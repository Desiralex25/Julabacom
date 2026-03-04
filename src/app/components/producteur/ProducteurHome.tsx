import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useProducteur } from '../../contexts/ProducteurContext';
import { Navigation } from '../layout/Navigation';
import { TantieSagesse } from '../assistant/TantieSagesse';
import { RoleDashboard } from '../shared/RoleDashboard';
import { getRoleConfig } from '../../config/roleConfig';
import {
  RecoltesModal,
  VentesModal,
  StocksModal,
  ScoreModal,
  ResumeModal,
  CycleModal,
  DeclareRecolteModal,
} from './ProducteurModals';
import tantieSagesseImgProducteur from 'figma:asset/ea74d578f6b563853423b6d08f6cc6dcb454702f.png';
import { buildAlertesProducteur } from '../shared/AlertesBanner';

export function ProducteurHome() {
  const navigate = useNavigate();
  const { user, speak, setIsModalOpen } = useApp();
  const { stats, alertes } = useProducteur();
  
  // Construire les alertes dynamiques
  const alertesBanner = buildAlertesProducteur(alertes);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isJourneeExpanded, setIsJourneeExpanded] = useState(false);
  const [showRecoltesModal, setShowRecoltesModal] = useState(false);
  const [showVentesModal, setShowVentesModal] = useState(false);
  const [showStocksModal, setShowStocksModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showTantieSagesseModal, setShowTantieSagesseModal] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showDeclareRecolteModal, setShowDeclareRecolteModal] = useState(false);

  // Gérer l'affichage de la bottom bar selon l'état des modals
  useEffect(() => {
    const isAnyModalOpen = showRecoltesModal || showVentesModal || showStocksModal || showScoreModal || 
                          showResumeModal || showTantieSagesseModal || showCycleModal || showDeclareRecolteModal;
    setIsModalOpen(isAnyModalOpen);
  }, [showRecoltesModal, showVentesModal, showStocksModal, showScoreModal, showResumeModal, 
      showTantieSagesseModal, showCycleModal, showDeclareRecolteModal, setIsModalOpen]);

  // Configuration du rôle Producteur
  const roleConfig = getRoleConfig('producteur');

  // Stats adaptées pour RoleDashboard
  const dashboardStats = {
    kpi1Value: stats.productionTotale, // Production totale en kg
    kpi2Value: stats.revenusTotaux, // Revenus totaux en FCFA
  };

  const handleListenMessage = () => {
    let message = '';
    
    if (stats.productionTotale > 0 && stats.revenusTotaux === 0) {
      message = `Tu as ${stats.productionTotale.toLocaleString()} kilogrammes de production. Commence à vendre !`;
    } else if (stats.productionTotale > 0 && stats.revenusTotaux > 0) {
      message = `Bravo ! Tu as ${stats.productionTotale.toLocaleString()} kilogrammes produits et ${stats.revenusTotaux.toLocaleString()} francs CFA de revenus`;
    } else {
      message = `Bonjour ${user?.firstName} ! Crée ton premier cycle agricole pour démarrer`;
    }
    
    speak(message);
  };

  const handleTantieSagesseClick = () => {
    setShowTantieSagesseModal(true);
    speak('Bonjour ! Comment puis-je t\'aider avec tes cultures aujourd\'hui ?');
  };

  // Greeting personnalisé basé sur les stats
  const customGreeting = (
    <>
      {stats.productionTotale > 0 && stats.revenusTotaux === 0 && (
        `Tu as ${stats.productionTotale.toLocaleString()} kg de production. Commence à vendre !`
      )}
      {stats.productionTotale > 0 && stats.revenusTotaux > 0 && (
        `Bravo ! ${stats.productionTotale.toLocaleString()} kg produits et ${stats.revenusTotaux.toLocaleString()} FCFA de revenus`
      )}
      {stats.productionTotale === 0 && (
        `Bonjour ${user?.firstName} ! ${roleConfig.greeting}`
      )}
    </>
  );

  return (
    <>
      {/* Dashboard Producteur harmonisé - IDENTIQUE au Marchand */}
      <RoleDashboard
        roleConfig={roleConfig}
        role="producteur"
        user={user}
        currentSession={null} // Pas de session pour producteur
        stats={dashboardStats}
        isSpeaking={isSpeaking}
        isJourneeExpanded={isJourneeExpanded}
        setIsJourneeExpanded={setIsJourneeExpanded}
        handleListenMessage={handleListenMessage}
        setShowKPI1Modal={setShowRecoltesModal}
        setShowKPI2Modal={setShowVentesModal}
        setShowScoreModal={setShowScoreModal}
        setShowResumeModal={setShowResumeModal}
        setShowAction1Modal={setShowCycleModal}
        setShowAction2Modal={setShowDeclareRecolteModal}
        speak={speak}
        navigate={navigate}
        customGreeting={customGreeting as any}
        hasSessionManagement={false}
        showWallet={true}
        tantieSagesseImgSrc={tantieSagesseImgProducteur}
        onAcademyClick={() => navigate('/producteur/academy')}
        alertes={alertesBanner}
      />

      <Navigation role="producteur" onMicClick={handleTantieSagesseClick} />

      {/* Modals Stats */}
      <RecoltesModal isOpen={showRecoltesModal} onClose={() => setShowRecoltesModal(false)} />
      <VentesModal isOpen={showVentesModal} onClose={() => setShowVentesModal(false)} />
      <ScoreModal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} />
      <ResumeModal isOpen={showResumeModal} onClose={() => setShowResumeModal(false)} />
      
      {/* Modals Actions */}
      <CycleModal isOpen={showCycleModal} onClose={() => setShowCycleModal(false)} />
      <DeclareRecolteModal isOpen={showDeclareRecolteModal} onClose={() => setShowDeclareRecolteModal(false)} />

      {/* Tantie Sagesse */}
      {showTantieSagesseModal && (
        <TantieSagesse 
          isOpen={showTantieSagesseModal} 
          onClose={() => setShowTantieSagesseModal(false)} 
        />
      )}
    </>
  );
}