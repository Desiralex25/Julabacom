import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { Navigation } from '../layout/Navigation';
import { TantieSagesse } from '../assistant/TantieSagesse';
import { AdministrateurDashboard } from './AdministrateurDashboard';

export function AdministrateurHome() {
  const navigate = useNavigate();
  const { user, speak } = useApp();
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [showUtilisateursModal, setShowUtilisateursModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showRapportModal, setShowRapportModal] = useState(false);
  const [showTantieSagesseModal, setShowTantieSagesseModal] = useState(false);

  // Stats mockées pour l'administrateur
  const stats = {
    utilisateurs: 1247,
    transactions: 3854,
    volume: 42500000, // 42.5M FCFA
  };

  const handleListenMessage = () => {
    const message = `Bonjour ${user?.firstName} ! Supervise la plateforme JULABA`;
    speak(message);
  };

  const handleTantieSagesseClick = () => {
    setShowTantieSagesseModal(true);
    speak('Bonjour Administrateur ! Comment puis-je vous assister ?');
  };

  return (
    <>
      {/* Dashboard Administrateur */}
      <AdministrateurDashboard
        user={user}
        stats={stats}
        isSpeaking={isSpeaking}
        isStatsExpanded={isStatsExpanded}
        setIsStatsExpanded={setIsStatsExpanded}
        handleListenMessage={handleListenMessage}
        setShowUtilisateursModal={setShowUtilisateursModal}
        setShowTransactionsModal={setShowTransactionsModal}
        setShowRapportModal={setShowRapportModal}
        speak={speak}
        navigate={navigate}
      />

      {/* Tantie Sagesse - Maintenant dans le modal du BottomBar */}
      {/* <TantieSagesse floating /> */}

      <Navigation role="institution" onMicClick={handleTantieSagesseClick} />

      {/* TODO: Ajouter les modals Utilisateurs/Transactions/Rapports ici */}
    </>
  );
}