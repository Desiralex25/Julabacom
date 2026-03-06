import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  ScoreJulaba, 
  ScoringCriteria, 
  BadgeLevel, 
  SCORING_WEIGHTS,
  getBadgeLevel 
} from '../types/julaba.types';
import * as scoresApi from '../../imports/scores-api';
import { DEV_MODE, devLog } from '../config/devMode';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

interface ScoreContextType {
  scores: Map<string, ScoreJulaba>;
  
  // Calcul score
  calculerScore: (userId: string) => Promise<ScoreJulaba>;
  recalculerScore: (userId: string) => Promise<void>;
  
  // Getters
  getScoreByUser: (userId: string) => ScoreJulaba | undefined;
  getBadge: (userId: string) => BadgeLevel;
  
  // Impact scoring
  getVisibiliteMarketplace: (userId: string) => 'NORMALE' | 'AUGMENTEE' | 'PREMIUM';
  hasAccessCredit: (userId: string) => boolean;
  
  // Charger depuis Supabase
  loadScore: (userId: string) => Promise<void>;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<Map<string, ScoreJulaba>>(new Map());

  // Charger le score d'un utilisateur depuis Supabase
  const loadScore = async (userId: string) => {
    if (DEV_MODE) {
      devLog('ScoreContext', 'Mode dev - skip loadScore');
      return;
    }
    try {
      const { score } = await scoresApi.fetchScore(userId);
      
      // Convertir le score Supabase en ScoreJulaba
      const scoreJulaba: ScoreJulaba = {
        userId: score.user_id,
        scoreTotal: score.score_total,
        niveau: getBadgeLevel(score.score_total),
        
        criteres: {
          regularite: score.score_ponctualite || 0,
          documents: score.score_qualite || 0,
          volume: score.score_fiabilite || 0,
          feedback: score.score_qualite || 0,
        },
        
        joursActifsDerniers30j: Math.round((score.score_ponctualite / 100) * 30),
        documentsValidesRatio: score.score_qualite / 100,
        volumeDerniers30j: score.nb_transactions,
        volumeMoyenZone: 0,
        feedbackPositifsRatio: score.nb_avis > 0 ? score.score_qualite / 100 : 0,
        
        visibiliteMarketplace: score.score_total >= 90 ? 'PREMIUM' : score.score_total >= 75 ? 'AUGMENTEE' : 'NORMALE',
        accessCredit: score.score_total >= 70,
        
        evolutionScore: [],
        
        lastCalculatedAt: score.updated_at,
      };
      
      setScores(new Map(scores.set(userId, scoreJulaba)));
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      console.error('Error loading score:', error);
    }
  };

  // Calculer le critère "Régularité" (35%)
  const calculerRegularite = (userId: string): number => {
    // TODO: Calculer depuis les transactions réelles
    return 75;
  };

  // Calculer le critère "Documents" (15%)
  const calculerDocuments = (userId: string): number => {
    // TODO: Calculer depuis les documents validés
    return 80;
  };

  // Calculer le critère "Volume" (35%)
  const calculerVolume = (userId: string, region: string): number => {
    // TODO: Calculer depuis les transactions
    return 70;
  };

  // Calculer le critère "Feedback" (15%)
  const calculerFeedback = (userId: string): number => {
    // TODO: Calculer depuis les avis
    return 85;
  };

  // Calculer le score total
  const calculerScore = async (userId: string): Promise<ScoreJulaba> => {
    // Calculer chaque critère
    const regularite = calculerRegularite(userId);
    const documents = calculerDocuments(userId);
    const volume = calculerVolume(userId, 'Abidjan');
    const feedback = calculerFeedback(userId);
    
    // Appliquer les poids
    const pointsRegularite = regularite * SCORING_WEIGHTS.REGULARITE;
    const pointsDocuments = documents * SCORING_WEIGHTS.DOCUMENTS;
    const pointsVolume = volume * SCORING_WEIGHTS.VOLUME;
    const pointsFeedback = feedback * SCORING_WEIGHTS.FEEDBACK;
    
    // Score total
    const scoreTotal = Math.round(pointsRegularite + pointsDocuments + pointsVolume + pointsFeedback);
    
    // Niveau badge
    const niveau = getBadgeLevel(scoreTotal);
    
    // Déterminer impact
    let visibiliteMarketplace: 'NORMALE' | 'AUGMENTEE' | 'PREMIUM' = 'NORMALE';
    if (scoreTotal >= 90) visibiliteMarketplace = 'PREMIUM';
    else if (scoreTotal >= 75) visibiliteMarketplace = 'AUGMENTEE';
    
    const accessCredit = scoreTotal >= 70;
    
    // Récupérer historique existant
    const existingScore = scores.get(userId);
    const evolutionScore = existingScore?.evolutionScore || [];
    
    // Ajouter point dans l'évolution
    evolutionScore.push({
      date: new Date().toISOString(),
      score: scoreTotal,
    });
    
    // Garder seulement les 30 derniers points
    if (evolutionScore.length > 30) {
      evolutionScore.shift();
    }
    
    // Construire l'objet score
    const scoreJulaba: ScoreJulaba = {
      userId,
      scoreTotal,
      niveau,
      
      criteres: {
        regularite,
        documents,
        volume,
        feedback,
      },
      
      joursActifsDerniers30j: Math.round((regularite / 100) * 30),
      documentsValidesRatio: documents / 100,
      volumeDerniers30j: 0,
      volumeMoyenZone: 0,
      feedbackPositifsRatio: feedback / 100,
      
      visibiliteMarketplace,
      accessCredit,
      
      evolutionScore,
      
      lastCalculatedAt: new Date().toISOString(),
    };
    
    // Sauvegarder localement
    setScores(new Map(scores.set(userId, scoreJulaba)));
    
    // Sauvegarder dans Supabase
    try {
      await scoresApi.updateScore(userId, {
        score_total: scoreTotal,
        score_fiabilite: volume,
        score_qualite: documents,
        score_ponctualite: regularite,
        nb_avis: 0,
      });
    } catch (error) {
      console.error('Error saving score to Supabase:', error);
    }
    
    return scoreJulaba;
  };

  // Recalculer score (appelé après chaque transaction)
  const recalculerScore = async (userId: string) => {
    await calculerScore(userId);
  };

  // Getters
  const getScoreByUser = (userId: string) => {
    return scores.get(userId);
  };

  const getBadge = (userId: string): BadgeLevel => {
    const score = scores.get(userId);
    return score?.niveau || 'BRONZE';
  };

  const getVisibiliteMarketplace = (userId: string) => {
    const score = scores.get(userId);
    return score?.visibiliteMarketplace || 'NORMALE';
  };

  const hasAccessCredit = (userId: string): boolean => {
    const score = scores.get(userId);
    return score?.accessCredit || false;
  };

  const value: ScoreContextType = {
    scores,
    calculerScore,
    recalculerScore,
    getScoreByUser,
    getBadge,
    getVisibiliteMarketplace,
    hasAccessCredit,
    loadScore,
  };

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
}

export function useScore() {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScore doit être utilisé dans un ScoreProvider');
  }
  return context;
}