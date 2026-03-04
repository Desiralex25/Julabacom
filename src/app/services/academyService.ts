/**
 * ACADEMY SERVICE - Gestion persistence localStorage
 * 
 * Gère toutes les données Academy de l'utilisateur :
 * - XP et niveau
 * - Streak et bouclier
 * - Formations complétées
 * - Badges débloqués
 */

import { UserRole } from '../components/academy/types';

export interface AcademyUserData {
  userId: string;
  role: UserRole;
  academyPoints: number;
  academyLevel: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  shieldAvailable: boolean;
  shieldLastReset: string;
  badges: string[];
  completedFormations: string[];
  formationProgress: {
    [formationId: string]: {
      started: boolean;
      completed: boolean;
      score?: number;
      completedAt?: string;
    };
  };
  stats: {
    totalFormationsCompleted: number;
    totalXpEarned: number;
    averageScore: number;
    perfectScores: number;
  };
}

const STORAGE_KEY = 'julaba_academy_data';

/**
 * Obtenir les données Academy de l'utilisateur
 */
export function getAcademyData(userId: string, role: UserRole): AcademyUserData {
  const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Données de démo pré-remplies (150 XP, streak 5 jours, 2 formations complétées)
  return initializeDemoData(userId, role);
}

/**
 * Sauvegarder les données Academy
 */
export function saveAcademyData(data: AcademyUserData): void {
  localStorage.setItem(`${STORAGE_KEY}_${data.userId}`, JSON.stringify(data));
}

/**
 * Initialiser avec données de démo
 */
function initializeDemoData(userId: string, role: UserRole): AcademyUserData {
  const today = new Date().toISOString().split('T')[0];
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  
  return {
    userId,
    role,
    academyPoints: 150,
    academyLevel: 'debutant', // 150 XP = encore Débutant (0-199)
    currentStreak: 5,
    longestStreak: 8,
    lastActivityDate: today,
    shieldAvailable: true,
    shieldLastReset: today,
    badges: ['premier_module', 'enflamme'],
    completedFormations: ['marchand_gestion_caisse', 'marchand_fixation_prix'],
    formationProgress: {
      'marchand_gestion_caisse': {
        started: true,
        completed: true,
        score: 100,
        completedAt: fiveDaysAgo.toISOString(),
      },
      'marchand_fixation_prix': {
        started: true,
        completed: true,
        score: 66,
        completedAt: today,
      },
    },
    stats: {
      totalFormationsCompleted: 2,
      totalXpEarned: 150,
      averageScore: 83,
      perfectScores: 1,
    },
  };
}

/**
 * Ajouter des points XP
 */
export function addPoints(userId: string, points: number): AcademyUserData {
  const data = getAcademyData(userId, 'marchand');
  data.academyPoints += points;
  data.stats.totalXpEarned += points;
  
  // Mettre à jour le niveau
  data.academyLevel = getLevelFromPoints(data.academyPoints);
  
  saveAcademyData(data);
  return data;
}

/**
 * Marquer une formation comme complétée
 */
export function completeFormation(
  userId: string,
  formationId: string,
  score: number,
  xpEarned: number
): AcademyUserData {
  const data = getAcademyData(userId, 'marchand');
  
  // Mettre à jour la progression
  data.formationProgress[formationId] = {
    started: true,
    completed: true,
    score,
    completedAt: new Date().toISOString(),
  };
  
  // Ajouter à la liste des formations complétées
  if (!data.completedFormations.includes(formationId)) {
    data.completedFormations.push(formationId);
  }
  
  // Ajouter les points
  data.academyPoints += xpEarned;
  data.stats.totalXpEarned += xpEarned;
  data.stats.totalFormationsCompleted += 1;
  
  // Mettre à jour moyenne
  const totalScore = data.stats.averageScore * (data.stats.totalFormationsCompleted - 1) + score;
  data.stats.averageScore = Math.round(totalScore / data.stats.totalFormationsCompleted);
  
  // Compter les scores parfaits
  if (score === 100) {
    data.stats.perfectScores += 1;
  }
  
  // Mettre à jour le niveau
  data.academyLevel = getLevelFromPoints(data.academyPoints);
  
  // Mettre à jour le streak
  updateStreak(data);
  
  saveAcademyData(data);
  return data;
}

/**
 * Mettre à jour le streak
 */
export function updateStreak(data: AcademyUserData): void {
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = data.lastActivityDate;
  
  if (lastActivity === today) {
    // Déjà fait aujourd'hui
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (lastActivity === yesterdayStr) {
    // Continuité du streak
    data.currentStreak += 1;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
  } else {
    // Streak cassé (géré par le bouclier ailleurs)
    data.currentStreak = 1;
  }
  
  data.lastActivityDate = today;
}

/**
 * Utiliser le bouclier de streak
 */
export function useShield(userId: string): AcademyUserData {
  const data = getAcademyData(userId, 'marchand');
  
  if (data.shieldAvailable) {
    data.shieldAvailable = false;
    // Le streak est sauvé, on met juste à jour la date
    data.lastActivityDate = new Date().toISOString().split('T')[0];
  }
  
  saveAcademyData(data);
  return data;
}

/**
 * Vérifier si le streak doit être cassé
 */
export function checkStreakStatus(userId: string, role: UserRole): {
  needsShield: boolean;
  daysMissed: number;
} {
  const data = getAcademyData(userId, role);
  const today = new Date();
  const lastActivity = new Date(data.lastActivityDate);
  
  const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 2 && diffDays < 3) {
    // 48h passées, besoin du bouclier
    return { needsShield: true, daysMissed: diffDays };
  } else if (diffDays >= 3) {
    // Trop tard, streak perdu même avec bouclier
    return { needsShield: false, daysMissed: diffDays };
  }
  
  return { needsShield: false, daysMissed: 0 };
}

/**
 * Réinitialiser le bouclier (chaque lundi)
 */
export function resetShieldIfNeeded(userId: string): void {
  const data = getAcademyData(userId, 'marchand');
  const lastReset = new Date(data.shieldLastReset);
  const today = new Date();
  
  // Vérifier si on est lundi et que le dernier reset n'était pas cette semaine
  if (today.getDay() === 1) {
    const diffTime = Math.abs(today.getTime() - lastReset.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 7) {
      data.shieldAvailable = true;
      data.shieldLastReset = today.toISOString().split('T')[0];
      saveAcademyData(data);
    }
  }
}

/**
 * Débloquer un badge
 */
export function unlockBadge(userId: string, badgeId: string): AcademyUserData {
  const data = getAcademyData(userId, 'marchand');
  
  if (!data.badges.includes(badgeId)) {
    data.badges.push(badgeId);
    saveAcademyData(data);
  }
  
  return data;
}

/**
 * Obtenir le niveau selon les points
 */
export function getLevelFromPoints(points: number): string {
  if (points < 200) return 'debutant';
  if (points < 500) return 'actif';
  if (points < 1000) return 'expert';
  return 'leader';
}

/**
 * Calculer la progression vers le niveau suivant
 */
export function getProgressToNextLevel(points: number): {
  currentLevel: string;
  nextLevel: string | null;
  pointsToNext: number;
  percentage: number;
} {
  const levels = [
    { name: 'debutant', min: 0, max: 199 },
    { name: 'actif', min: 200, max: 499 },
    { name: 'expert', min: 500, max: 999 },
    { name: 'leader', min: 1000, max: Infinity },
  ];
  
  const currentLevelData = levels.find(l => points >= l.min && points <= l.max)!;
  const currentIndex = levels.indexOf(currentLevelData);
  const nextLevelData = levels[currentIndex + 1];
  
  if (!nextLevelData) {
    return {
      currentLevel: currentLevelData.name,
      nextLevel: null,
      pointsToNext: 0,
      percentage: 100,
    };
  }
  
  const pointsToNext = nextLevelData.min - points;
  const range = nextLevelData.min - currentLevelData.min;
  const progress = points - currentLevelData.min;
  const percentage = Math.round((progress / range) * 100);
  
  return {
    currentLevel: currentLevelData.name,
    nextLevel: nextLevelData.name,
    pointsToNext,
    percentage,
  };
}

/**
 * Calculer le bonus Score Jùlaba (10 XP = +1 Score)
 */
export function getJulabaScoreBonus(xpEarned: number): number {
  return Math.floor(xpEarned / 10);
}
