import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useStock } from '../../contexts/StockContext';
import { Navigation } from '../layout/Navigation';
import { RoleDashboard } from '../shared/RoleDashboard';
import { getRoleConfig } from '../../config/roleConfig';
import { buildAlertesMarchand } from '../shared/AlertesBanner';
import { VenteVocaleModal } from './VenteVocaleModal';
import {
  OpenDayModal,
  EditFondModal,
  CloseDayModal,
  StatsVentesModal,
  StatsMargeModal,
  ScoreModal,
  ResumeModal,
} from './MarchandModals';
const tantieSagesseImgMarchand = '/images/tantie-sagesse.svg';

export function MarchandHome() {
  const navigate = useNavigate();
  const { user, speak, currentSession, getTodayStats } = useApp();
  const { getStockFaible } = useStock();
  
  const alertesMarchand = buildAlertesMarchand(getStockFaible());
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isJourneeExpanded, setIsJourneeExpanded] = useState(false);
  const [showOpenDayModal, setShowOpenDayModal] = useState(false);
  const [showCloseDayModal, setShowCloseDayModal] = useState(false);
  const [showEditFondModal, setShowEditFondModal] = useState(false);
  const [showStatsVentesModal, setShowStatsVentesModal] = useState(false);
  const [showStatsMargeModal, setShowStatsMargeModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCoachMark, setShowCoachMark] = useState(false);
  const [showVenteVocaleModal, setShowVenteVocaleModal] = useState(false);

  const roleConfig = getRoleConfig('marchand');
  const stats = getTodayStats();

  const dashboardStats = {
    kpi1Value: stats.ventes,
    kpi2Value: stats.ventes - stats.depenses,
    caisse: stats.caisse,
  };

  useEffect(() => {
    if (!currentSession?.opened) {
      const timer = setTimeout(() => {
        setShowCoachMark(true);
        speak('Ouvre ta journée pour activer ta caisse');
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowCoachMark(false);
    }
  }, [currentSession?.opened, speak]);

  const handleListenMessage = () => {
    if (!currentSession?.opened) {
      speak(`Bonjour ${user?.firstName} ! Ouvre ta journée pour commencer`);
      return;
    }
    let message = '';
    if (stats.ventes > 0 && stats.depenses === 0) {
      message = `Bravo ! Tu as ${stats.ventes.toLocaleString()} francs CFA de ventes. Ta caisse est à ${stats.caisse.toLocaleString()} francs CFA`;
    } else if (stats.ventes > 0 && stats.depenses > 0) {
      message = `Ta caisse actuelle est de ${stats.caisse.toLocaleString()} francs CFA. Continue comme ça !`;
    } else if (stats.ventes === 0 && stats.depenses > 0) {
      message = `Attention, tu as ${stats.depenses.toLocaleString()} francs CFA de dépenses. Ta caisse est à ${stats.caisse.toLocaleString()} francs CFA`;
    } else {
      message = `Ta caisse est prête avec ${stats.caisse.toLocaleString()} francs CFA. Commence à vendre !`;
    }
    speak(message);
  };

  const customGreeting = (currentSession?.opened && currentSession.opened === true) ? (
    <>
      {stats.ventes > 0 && stats.depenses === 0 && (
        `Bravo ! Tu as ${stats.ventes.toLocaleString()} FCFA de ventes. Ta caisse est à ${stats.caisse.toLocaleString()} FCFA`
      )}
      {stats.ventes > 0 && stats.depenses > 0 && (
        `Ta caisse actuelle est de ${stats.caisse.toLocaleString()} FCFA. Continue comme ça !`
      )}
      {stats.ventes === 0 && stats.depenses > 0 && (
        `Attention, tu as ${stats.depenses.toLocaleString()} FCFA de dépenses. Ta caisse est à ${stats.caisse.toLocaleString()} FCFA`
      )}
      {stats.ventes === 0 && stats.depenses === 0 && (
        `Ta caisse est prête avec ${stats.caisse.toLocaleString()} FCFA. Commence à vendre !`
      )}
    </>
  ) : (
    `Bonjour ${user?.firstName} ! Ouvre ta journée pour commencer`
  );

  return (
    <>
      <RoleDashboard
        roleConfig={roleConfig}
        role="marchand"
        user={user}
        currentSession={currentSession}
        stats={dashboardStats}
        isSpeaking={isSpeaking}
        isJourneeExpanded={isJourneeExpanded}
        setIsJourneeExpanded={setIsJourneeExpanded}
        handleListenMessage={handleListenMessage}
        setShowOpenDayModal={setShowOpenDayModal}
        setShowEditFondModal={setShowEditFondModal}
        setShowCloseDayModal={setShowCloseDayModal}
        setShowKPI1Modal={setShowStatsVentesModal}
        setShowKPI2Modal={setShowStatsMargeModal}
        setShowScoreModal={setShowScoreModal}
        setShowResumeModal={setShowResumeModal}
        setShowAction1Modal={setShowVenteVocaleModal}
        speak={speak}
        navigate={navigate}
        showCoachMark={showCoachMark}
        onDismissCoachMark={() => setShowCoachMark(false)}
        hasSessionManagement={true}
        showWallet={true}
        tantieSagesseImgSrc={tantieSagesseImgMarchand}
        onAcademyClick={() => navigate('/marchand/academy')}
        alertes={alertesMarchand}
      />

      <Navigation role="marchand" />

      <OpenDayModal isOpen={showOpenDayModal} onClose={() => setShowOpenDayModal(false)} />
      <EditFondModal
        isOpen={showEditFondModal}
        onClose={() => setShowEditFondModal(false)}
        currentFond={currentSession?.fondInitial || 0}
      />
      <CloseDayModal
        isOpen={showCloseDayModal}
        onClose={() => setShowCloseDayModal(false)}
        stats={stats}
      />
      <StatsVentesModal
        isOpen={showStatsVentesModal}
        onClose={() => setShowStatsVentesModal(false)}
        montant={stats.ventes}
      />
      <StatsMargeModal
        isOpen={showStatsMargeModal}
        onClose={() => setShowStatsMargeModal(false)}
        marge={stats.ventes - stats.depenses}
      />
      <ScoreModal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} />
      <ResumeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        stats={stats}
      />
      <VenteVocaleModal
        isOpen={showVenteVocaleModal}
        onClose={() => setShowVenteVocaleModal(false)}
      />
    </>
  );
}