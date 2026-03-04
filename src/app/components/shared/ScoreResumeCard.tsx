/**
 * 📊 SCORE & RÉSUMÉ DU JOUR - Composant Universel
 * 
 * Composant refactorisé selon les propositions UX P0 :
 * - Vocabulaire accessible ("Ce que tu devrais avoir")
 * - Couleurs neutres pour dépenses (orange doux)
 * - Score contextualisé avec bénéfices
 * - Actions guidées cliquables
 * - Graphique 7 derniers jours
 * - Lien vers JULABA Academy
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Info,
  GraduationCap,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router';
import { SharedCard } from './Card';
import { ScoreOnboardingModal } from './ScoreOnboardingModal';
import { ActionsGuideesCard } from './ActionsGuideesCard';
import { useScoreJULABA } from '../../hooks/useScoreJULABA';
import { RoleType } from '../../config/roleConfig';

// ─── Configuration dynamique du Résumé par rôle ──────────────────────────────
interface ResumeLineConfig {
  label: string;
  unit: string;
  bgColor: string;
  dotColor: string;
  textColor: string;
  tooltip?: string;
}
interface ResumeConfig {
  title: string;
  historique: string;
  ligne1: ResumeLineConfig;
  ligne2: ResumeLineConfig;
  ligne3: ResumeLineConfig;
  speakFn: (v1: number, v2: number, v3: number) => string;
}

const RESUME_BY_ROLE: Record<RoleType, ResumeConfig> = {
  marchand: {
    title: 'Résumé du jour',
    historique: "Voir l'historique 7 jours",
    ligne1: { label: 'Ventes du jour',        unit: 'FCFA',    bgColor: 'bg-green-50',  dotColor: 'bg-green-500',  textColor: 'text-green-700' },
    ligne2: { label: 'Dépenses du jour',       unit: 'FCFA',    bgColor: 'bg-orange-50', dotColor: 'bg-orange-500', textColor: 'text-orange-700' },
    ligne3: { label: 'Ce que tu devrais avoir',unit: 'FCFA',    bgColor: 'bg-gray-50',   dotColor: 'bg-gray-500',   textColor: 'text-gray-700', tooltip: 'Calculé à partir de tes ventes moins tes dépenses' },
    speakFn: (v1, v2, v3) => `Résumé du jour : tu as vendu pour ${v1.toLocaleString()} francs, dépensé ${v2.toLocaleString()} francs, et tu devrais avoir ${v3.toLocaleString()} francs en caisse`,
  },
  producteur: {
    title: 'Résumé du jour',
    historique: 'Voir les récoltes 7 jours',
    ligne1: { label: 'Récoltes du jour',       unit: 'kg',      bgColor: 'bg-green-50',  dotColor: 'bg-green-500',  textColor: 'text-green-700' },
    ligne2: { label: 'Dépenses agricoles',     unit: 'FCFA',    bgColor: 'bg-orange-50', dotColor: 'bg-orange-500', textColor: 'text-orange-700' },
    ligne3: { label: 'Revenus du jour',         unit: 'FCFA',    bgColor: 'bg-blue-50',   dotColor: 'bg-blue-500',   textColor: 'text-blue-700', tooltip: 'Total des ventes de tes récoltes du jour' },
    speakFn: (v1, v2, v3) => `Résumé du jour : tu as récolté ${v1.toLocaleString()} kilogrammes, dépensé ${v2.toLocaleString()} francs pour ta ferme, et gagné ${v3.toLocaleString()} francs de revenus`,
  },
  cooperative: {
    title: "Résumé d'activité",
    historique: 'Voir les opérations 7 jours',
    ligne1: { label: 'Volume groupé du jour',  unit: 'kg',      bgColor: 'bg-blue-50',   dotColor: 'bg-blue-500',   textColor: 'text-blue-700' },
    ligne2: { label: 'Transactions du jour',   unit: 'FCFA',    bgColor: 'bg-orange-50', dotColor: 'bg-orange-500', textColor: 'text-orange-700' },
    ligne3: { label: 'Solde coopérative',      unit: 'FCFA',    bgColor: 'bg-gray-50',   dotColor: 'bg-gray-500',   textColor: 'text-gray-700', tooltip: 'Solde actuel du wallet de la coopérative' },
    speakFn: (v1, v2, v3) => `Résumé du jour : la coopérative a groupé ${v1.toLocaleString()} kilogrammes, traité ${v2.toLocaleString()} francs de transactions, et le solde est de ${v3.toLocaleString()} francs`,
  },
  identificateur: {
    title: 'Résumé du jour',
    historique: 'Voir les identifications 7 jours',
    ligne1: { label: 'Identifications du jour',unit: 'acteurs', bgColor: 'bg-green-50',  dotColor: 'bg-green-500',  textColor: 'text-green-700' },
    ligne2: { label: 'Revenus du jour',         unit: 'FCFA',    bgColor: 'bg-orange-50', dotColor: 'bg-orange-500', textColor: 'text-orange-700' },
    ligne3: { label: 'Total acteurs identifiés',unit: 'acteurs', bgColor: 'bg-gray-50',   dotColor: 'bg-gray-500',   textColor: 'text-gray-700', tooltip: 'Nombre total d\'acteurs que tu as identifiés depuis le début' },
    speakFn: (v1, v2, v3) => `Résumé du jour : tu as identifié ${v1} acteurs aujourd'hui, gagné ${v2.toLocaleString()} francs, et ton total est de ${v3} acteurs identifiés`,
  },
  institution: {
    title: "Vue d'ensemble",
    historique: 'Voir les statistiques 7 jours',
    ligne1: { label: 'Utilisateurs actifs',    unit: 'acteurs', bgColor: 'bg-green-50',  dotColor: 'bg-green-500',  textColor: 'text-green-700' },
    ligne2: { label: 'Volume total du jour',   unit: 'FCFA',    bgColor: 'bg-blue-50',   dotColor: 'bg-blue-500',   textColor: 'text-blue-700' },
    ligne3: { label: 'Transactions du jour',   unit: 'opérations', bgColor: 'bg-gray-50', dotColor: 'bg-gray-500',  textColor: 'text-gray-700', tooltip: 'Nombre total de transactions enregistrées aujourd\'hui' },
    speakFn: (v1, v2, v3) => `Vue d'ensemble : ${v1} utilisateurs actifs, ${v2.toLocaleString()} francs de volume total, et ${v3} transactions aujourd'hui`,
  },
  administrateur: {
    title: "Vue d'ensemble",
    historique: 'Voir les statistiques 7 jours',
    ligne1: { label: 'Utilisateurs actifs',    unit: 'acteurs', bgColor: 'bg-green-50',  dotColor: 'bg-green-500',  textColor: 'text-green-700' },
    ligne2: { label: 'Volume total du jour',   unit: 'FCFA',    bgColor: 'bg-blue-50',   dotColor: 'bg-blue-500',   textColor: 'text-blue-700' },
    ligne3: { label: 'Transactions du jour',   unit: 'opérations', bgColor: 'bg-gray-50', dotColor: 'bg-gray-500',  textColor: 'text-gray-700', tooltip: 'Nombre total de transactions enregistrées aujourd\'hui' },
    speakFn: (v1, v2, v3) => `Vue d'ensemble : ${v1} utilisateurs actifs, ${v2.toLocaleString()} francs de volume total, et ${v3} transactions aujourd'hui`,
  },
};

interface DailySummary {
  ventes: number;
  depenses: number;
  caisse: number;
}

interface ScoreResumeCardProps {
  score?: number;
  role: RoleType;
  primaryColor: string;
  dailySummary: DailySummary;
  historique7jours?: number[]; // Données pour le graphique
  speak?: (text: string) => void;
  onNavigateToAcademy?: () => void;
}

// Données de démonstration pour l'historique 7 jours
const generateMockHistory = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i],
    value: Math.floor(Math.random() * 50000) + 10000,
  }));
};

export function ScoreResumeCard({
  score = 85,
  role,
  primaryColor,
  dailySummary,
  historique7jours,
  speak,
  onNavigateToAcademy,
}: ScoreResumeCardProps) {
  const navigate = useNavigate();
  const scoreData = useScoreJULABA(score, role);

  // Fallback sécurisé si role est inconnu / undefined
  const resumeCfg = RESUME_BY_ROLE[role] ?? RESUME_BY_ROLE.marchand;
  
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [chartData] = useState(generateMockHistory());

  // Onboarding obligatoire au premier lancement
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`julaba_score_onboarding_${role}`);
    if (!hasSeenOnboarding) {
      // Délai pour laisser le dashboard se charger
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [role]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(`julaba_score_onboarding_${role}`, 'true');
  };

  const handleShowActions = () => {
    setShowActions(!showActions);
  };

  const handleNavigateToAcademy = () => {
    if (onNavigateToAcademy) {
      onNavigateToAcademy();
    } else {
      // Navigation par défaut vers l'academy
      navigate(`/${role}/academy`);
    }
  };

  const speakScore = () => {
    const message = `Ton score JULABA est de ${score} sur 100. Niveau ${scoreData.level.name}. ${
      scoreData.nextLevel 
        ? `Plus que ${scoreData.pointsToNextLevel} points pour atteindre le niveau ${scoreData.nextLevel.name}.`
        : 'Félicitations, tu es au niveau maximum !'
    }`;
    speak?.(message);
  };

  const speakResume = () => {
    const cfg = RESUME_BY_ROLE[role];
    const message = cfg.speakFn(dailySummary.ventes, dailySummary.depenses, dailySummary.caisse);
    speak?.(message);
  };

  return (
    <>
      {/* Card Score JULABA - VERSION SIMPLIFIÉE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <motion.div
          onClick={() => {
            speakScore();
            setShowScoreModal(true);
          }}
          whileHover={{ y: -5, scale: 1.02, boxShadow: `0 10px 30px ${primaryColor}22` }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-full text-left cursor-pointer"
        >
          <SharedCard 
            className="p-3 rounded-3xl border-2 bg-gradient-to-br"
            style={{ 
              borderColor: primaryColor,
              backgroundImage: `linear-gradient(135deg, ${primaryColor}05, white, ${primaryColor}05)`
            }}
          >
            {/* Titre et Score sur la même ligne */}
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-600 font-bold text-[20px]">Ton Score <span style={{ fontFamily: 'Calisga, serif', fontWeight: 700 }}>Jùlaba</span></p>
              <div className="flex items-center gap-2">
                <motion.p 
                  className="font-bold text-[28px]"
                  style={{ color: primaryColor }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {score}/100
                </motion.p>
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}22` }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: primaryColor }} />
                </motion.div>
              </div>
            </div>

            {/* Jauge de progression avec animation continue */}
            <div className="mb-2 relative">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                {/* Barre de progression */}
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ backgroundColor: primaryColor, width: `${score}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                {/* Effet shimmer animé en continu */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-20 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                  }}
                  animate={{
                    x: ['-100%', '500%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatDelay: 0.5
                  }}
                />
              </div>
            </div>

            {/* Message d'encouragement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm font-semibold mb-0.5 leading-tight" style={{ color: primaryColor }}>
                Ton dje est solide
              </p>
              <p className="text-xs text-gray-600 leading-tight">
                Si tu notes tout, ca t'aide plus tard
              </p>
            </motion.div>
          </SharedCard>
        </motion.div>
      </motion.div>

      {/* Toggle Actions + Lien Academy - DÉPLACÉ ICI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mb-4 grid grid-cols-2 gap-3"
      >
        <button
          onClick={handleShowActions}
          className="py-3 px-4 rounded-2xl font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          <TrendingUp className="w-4 h-4" />
          {showActions ? 'Masquer' : 'Astuces'}
        </button>

        <button
          onClick={handleNavigateToAcademy}
          className="py-3 px-4 rounded-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <GraduationCap className="w-4 h-4" />
          Jouons ensemble
        </button>
      </motion.div>

      {/* Card Actions guidées */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden"
          >
            <SharedCard className="p-4 rounded-3xl shadow-md bg-gradient-to-br from-white to-gray-50">
              <ActionsGuideesCard
                actions={scoreData.actions}
                primaryColor={primaryColor}
                onActionClick={(action) => {
                  speak?.(`${action.label}. ${action.description}. Cela te rapportera ${action.points} points`);
                }}
              />
            </SharedCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Résumé du jour */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <motion.div
          onClick={speakResume}
          whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-full text-left cursor-pointer"
        >
          <SharedCard className="p-3 rounded-3xl shadow-md bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
                </motion.div>
                <h3 className="font-bold text-base text-gray-900">{resumeCfg.title}</h3>
              </div>

              {/* Mini graphique */}
              <div className="w-16 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={primaryColor}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              {/* Ligne 1 */}
              {(() => {
                const l = resumeCfg.ligne1;
                return (
                  <div className={`flex items-center justify-between p-2 rounded-xl ${l.bgColor}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${l.dotColor}`} />
                      <p className="text-xs font-medium text-gray-700">{l.label}</p>
                    </div>
                    <p className={`text-sm font-bold ${l.textColor}`}>
                      {dailySummary.ventes.toLocaleString()} {l.unit}
                    </p>
                  </div>
                );
              })()}

              {/* Ligne 2 */}
              {(() => {
                const l = resumeCfg.ligne2;
                return (
                  <div className={`flex items-center justify-between p-2 rounded-xl ${l.bgColor}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${l.dotColor}`} />
                      <p className="text-xs font-medium text-gray-700">{l.label}</p>
                    </div>
                    <p className={`text-sm font-bold ${l.textColor}`}>
                      {dailySummary.depenses.toLocaleString()} {l.unit}
                    </p>
                  </div>
                );
              })()}

              {/* Ligne 3 */}
              {(() => {
                const l = resumeCfg.ligne3;
                return (
                  <div className={`flex items-center justify-between p-2 rounded-xl ${l.bgColor}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${l.dotColor}`} />
                      <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        {l.label}
                        {l.tooltip && (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              speak?.(l.tooltip!);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && speak?.(l.tooltip!)}
                            className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Info className="w-2.5 h-2.5 text-gray-600" />
                          </div>
                        )}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${l.textColor}`}>
                      {dailySummary.caisse.toLocaleString()} {l.unit}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Lien vers historique */}
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); }}
              onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
              className="mt-3 w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              {resumeCfg.historique}
            </div>
          </SharedCard>
        </motion.div>
      </motion.div>

      {/* Modals */}
      <ScoreOnboardingModal
        isOpen={showScoreModal || showOnboarding}
        onClose={showOnboarding ? handleCloseOnboarding : () => setShowScoreModal(false)}
        score={score}
        role={role}
        primaryColor={primaryColor}
        onStartActions={handleShowActions}
      />
    </>
  );
}