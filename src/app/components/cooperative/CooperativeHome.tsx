import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useCooperative } from '../../contexts/CooperativeContext';
import { Navigation } from '../layout/Navigation';
import { RoleDashboard } from '../shared/RoleDashboard';
import { getRoleConfig } from '../../config/roleConfig';
import { buildAlertesCooperative } from '../shared/AlertesBanner';
import { TantieSagesse } from '../assistant/TantieSagesse';
import {
  VolumeModal,
  TransactionsModal,
  ScoreModal,
  ResumeModal,
  AchatsGroupesModal,
  VentesGroupeesModal,
} from './CooperativeModals';
import tantieSagesseImgCooperative from 'figma:asset/121e6ffbfa2da9c30fe3d5ebdc24e581704d8241.png';

export function CooperativeHome() {
  const navigate = useNavigate();
  const { user, speak, setIsModalOpen } = useApp();
  const { stats, getMembresActifs, membres, soldeActuel, getCommandesEnCours } = useCooperative();
  
  // Construire alertes dynamiques coopérative
  const cotisationsImpayees = membres.filter(m => !m.cotisationPayee && m.statut === 'actif');
  const membresInactifs = membres.filter(m => m.statut === 'inactif');
  const alertesCooperative = buildAlertesCooperative({
    cotisationsImpayees,
    membresInactifs,
    commandesEnCours: getCommandesEnCours(),
    solde: soldeActuel,
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isJourneeExpanded, setIsJourneeExpanded] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showTantieSagesseModal, setShowTantieSagesseModal] = useState(false);
  const [showAchatsGroupesModal, setShowAchatsGroupesModal] = useState(false);
  const [showVentesGroupeesModal, setShowVentesGroupeesModal] = useState(false);

  // Gérer l'affichage de la bottom bar selon l'état des modals
  useEffect(() => {
    const isAnyModalOpen = showVolumeModal || showTransactionsModal || showScoreModal || 
                          showResumeModal || showTantieSagesseModal || showAchatsGroupesModal || 
                          showVentesGroupeesModal;
    setIsModalOpen(isAnyModalOpen);
  }, [showVolumeModal, showTransactionsModal, showScoreModal, showResumeModal, 
      showTantieSagesseModal, showAchatsGroupesModal, showVentesGroupeesModal, setIsModalOpen]);

  // Configuration du rôle Coopérative
  const roleConfig = getRoleConfig('cooperative');

  // Stats pour le dashboard
  const dashboardStats = {
    kpi1Value: stats.volumeGroupe, // Volume en kg
    kpi2Value: stats.tresorerieActuelle, // Trésorerie en FCFA
  };

  const currentSession = null; // Pas de session pour coopérative

  const handleListenMessage = () => {
    const message = `Bonjour ${user?.firstName} ! Votre coopérative compte ${getMembresActifs()} membres actifs avec ${dashboardStats.kpi1Value.toLocaleString()} kilogrammes groupés et ${dashboardStats.kpi2Value.toLocaleString()} francs CFA en trésorerie`;
    speak(message);
  };

  const handleTantieSagesseClick = () => {
    setShowTantieSagesseModal(true);
    speak('Bonjour ! Comment puis-je aider votre coopérative aujourd\'hui ?');
  };

  // Greeting personnalisé
  const customGreeting = (
    <>
      {dashboardStats.kpi1Value > 0 && (
        `${dashboardStats.kpi1Value.toLocaleString()} kg groupés • ${dashboardStats.kpi2Value.toLocaleString()} FCFA en trésorerie`
      )}
      {dashboardStats.kpi1Value === 0 && (
        `Bonjour ${user?.firstName} ! ${roleConfig.greeting}`
      )}
    </>
  );

  // Stats pour le modal résumé
  const resumeStats = {
    volume: dashboardStats.kpi1Value,
    transactions: dashboardStats.kpi2Value,
    membres: getMembresActifs(),
  };

  return (
    <>
      {/* Dashboard Coopérative harmonisé */}
      <RoleDashboard
        roleConfig={roleConfig}
        role="cooperative"
        user={user}
        currentSession={currentSession}
        stats={dashboardStats}
        isSpeaking={isSpeaking}
        isJourneeExpanded={isJourneeExpanded}
        setIsJourneeExpanded={setIsJourneeExpanded}
        handleListenMessage={handleListenMessage}
        setShowKPI1Modal={setShowVolumeModal}
        setShowKPI2Modal={setShowTransactionsModal}
        setShowScoreModal={setShowScoreModal}
        setShowResumeModal={setShowResumeModal}
        setShowAction1Modal={setShowAchatsGroupesModal}
        setShowAction2Modal={setShowVentesGroupeesModal}
        speak={speak}
        navigate={navigate}
        customGreeting={customGreeting as any}
        hasSessionManagement={false}
        showWallet={true}
        tantieSagesseImgSrc={tantieSagesseImgCooperative}
        onAcademyClick={() => navigate('/cooperative/academy')}
        alertes={alertesCooperative}
      />

      <Navigation role="cooperative" onMicClick={handleTantieSagesseClick} />

      {/* Modals KPIs */}
      <VolumeModal 
        isOpen={showVolumeModal} 
        onClose={() => setShowVolumeModal(false)}
        volume={dashboardStats.kpi1Value}
      />
      <TransactionsModal 
        isOpen={showTransactionsModal} 
        onClose={() => setShowTransactionsModal(false)}
        montant={dashboardStats.kpi2Value}
      />
      <ScoreModal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} />
      <ResumeModal 
        isOpen={showResumeModal} 
        onClose={() => setShowResumeModal(false)}
        stats={resumeStats}
      />

      {/* Modals Actions */}
      <AchatsGroupesModal 
        isOpen={showAchatsGroupesModal} 
        onClose={() => setShowAchatsGroupesModal(false)}
      />
      <VentesGroupeesModal 
        isOpen={showVentesGroupeesModal} 
        onClose={() => setShowVentesGroupeesModal(false)}
      />

      {/* Tantie Sagesse modal */}
      {showTantieSagesseModal && (
        <TantieSagesse
          isOpen={showTantieSagesseModal}
          onClose={() => setShowTantieSagesseModal(false)}
        />
      )}
    </>
  );
}