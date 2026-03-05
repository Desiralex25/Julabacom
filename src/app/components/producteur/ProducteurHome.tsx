import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useProducteur } from '../../contexts/ProducteurContext';
import { Navigation } from '../layout/Navigation';
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
import { buildAlertesProducteur } from '../shared/AlertesBanner';
const tantieSagesseImgProducteur = '/images/tantie-sagesse-producteur.svg';

export function ProducteurHome() {
  const navigate = useNavigate();
  const { user, speak, setIsModalOpen } = useApp();
  const { stats, alertes } = useProducteur();
  
  const alertesBanner = buildAlertesProducteur(alertes);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isJourneeExpanded, setIsJourneeExpanded] = useState(false);
  const [showRecoltesModal, setShowRecoltesModal] = useState(false);
  const [showVentesModal, setShowVentesModal] = useState(false);
  const [showStocksModal, setShowStocksModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showDeclareRecolteModal, setShowDeclareRecolteModal] = useState(false);

  useEffect(() => {
    const isAnyModalOpen = showRecoltesModal || showVentesModal || showStocksModal || showScoreModal || 
                          showResumeModal || showCycleModal || showDeclareRecolteModal;
    setIsModalOpen(isAnyModalOpen);
  }, [showRecoltesModal, showVentesModal, showStocksModal, showScoreModal, showResumeModal, 
      showCycleModal, showDeclareRecolteModal, setIsModalOpen]);

  const roleConfig = getRoleConfig('producteur');

  const dashboardStats = {
    kpi1Value: stats.productionTotale,
    kpi2Value: stats.revenusTotaux,
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
      <RoleDashboard
        roleConfig={roleConfig}
        role="producteur"
        user={user}
        currentSession={null}
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

      <Navigation role="producteur" />

      <RecoltesModal isOpen={showRecoltesModal} onClose={() => setShowRecoltesModal(false)} />
      <VentesModal isOpen={showVentesModal} onClose={() => setShowVentesModal(false)} />
      <ScoreModal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} />
      <ResumeModal isOpen={showResumeModal} onClose={() => setShowResumeModal(false)} />
      <CycleModal isOpen={showCycleModal} onClose={() => setShowCycleModal(false)} />
      <DeclareRecolteModal isOpen={showDeclareRecolteModal} onClose={() => setShowDeclareRecolteModal(false)} />
    </>
  );
}