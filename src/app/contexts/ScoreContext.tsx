import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ScoreJulaba, 
  ScoringCriteria, 
  BadgeLevel, 
  SCORING_WEIGHTS,
  getBadgeLevel 
} from '../types/julaba.types';

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
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<Map<string, ScoreJulaba>>(new Map());

  // TODO: Charger depuis Supabase
  // ✅ localStorage SUPPRIMÉ
  // useEffect(() => {
  //   const loadData = async () => {
  //     const { data } = await supabase.from('scores').select('*');
  //     const scoresMap = new Map(data?.map(s => [s.userId, s]) || []);
  //     setScores(scoresMap);
  //   };
  //   loadData();
  // }, []);

  // 📊 Calculer le critère "Régularité" (35%)
  const calculerRegularite = (userId: string): number => {
    // Compter les jours actifs dans les 30 derniers jours
    // Un jour est actif si au moins 1 transaction/action
    // TODO: Charger depuis Supabase
    const transactions: any[] = [];
    const userTransactions = transactions.filter((t: any) => t.userId === userId);
    
    const derniers30Jours = new Date();
    derniers30Jours.setDate(derniers30Jours.getDate() - 30);
    
    const transactionsRecentes = userTransactions.filter((t: any) => 
      new Date(t.date) >= derniers30Jours
    );
    
    // Extraire les jours uniques
    const joursActifs = new Set(
      transactionsRecentes.map((t: any) => new Date(t.date).toDateString())
    );
    
    const joursActivsCount = joursActifs.size;
    
    // Score sur 100
    return (joursActivsCount / 30) * 100;
  };

  // 📄 Calculer le critère "Documents" (15%)
  const calculerDocuments = (userId: string): number => {
    // TODO: Charger depuis Supabase
    const users: any[] = [];
    const user = users.find((u: any) => u.id === userId);
    
    if (!user || !user.documents) return 0;
    
    const docsObligatoires = ['carteIdentite', 'attestation', 'certification'];
    const docsValides = docsObligatoires.filter(
      docType => user.documents[docType]?.status === 'verified'
    );
    
    return (docsValides.length / docsObligatoires.length) * 100;
  };

  // 💰 Calculer le critère "Volume" (35%)
  const calculerVolume = (userId: string, region: string): number => {
    // TODO: Charger depuis Supabase
    const transactions: any[] = [];
    const walletTransactions: any[] = [];
    
    const derniers30Jours = new Date();
    derniers30Jours.setDate(derniers30Jours.getDate() - 30);
    
    // Volume personnel (transactions + wallet)
    const volumePerso = [...transactions, ...walletTransactions]
      .filter((t: any) => t.userId === userId && new Date(t.createdAt || t.date) >= derniers30Jours)
      .reduce((sum: number, t: any) => sum + (t.amount || t.price * t.quantity || 0), 0);
    
    // Calculer moyenne zone (tous utilisateurs de la même région)
    // TODO: Charger depuis Supabase
    const users: any[] = [];
    const usersZone = users.filter((u: any) => u.region === region);
    
    if (usersZone.length === 0) return 50; // Défaut si pas de données
    
    const volumesZone = usersZone.map((u: any) => {
      return [...transactions, ...walletTransactions]
        .filter((t: any) => t.userId === u.id && new Date(t.createdAt || t.date) >= derniers30Jours)
        .reduce((sum: number, t: any) => sum + (t.amount || t.price * t.quantity || 0), 0);
    });
    
    const volumeMoyenZone = volumesZone.reduce((a: number, b: number) => a + b, 0) / volumesZone.length;
    
    // Ratio (cappé à 150 pour pas exploser le score)
    const ratio = volumeMoyenZone > 0 ? (volumePerso / volumeMoyenZone) * 100 : 50;
    const cappedRatio = Math.min(ratio, 150);
    
    // Normaliser sur 100
    return (cappedRatio / 150) * 100;
  };

  // ⭐ Calculer le critère "Feedback" (15%)
  const calculerFeedback = (userId: string): number => {
    // TODO: Charger depuis Supabase
    const feedbacks: any[] = [];
    const userFeedbacks = feedbacks.filter((f: any) => f.targetUserId === userId);
    
    if (userFeedbacks.length === 0) return 50; // Défaut si aucun feedback
    
    const positifs = userFeedbacks.filter((f: any) => f.rating >= 4).length;
    
    return (positifs / userFeedbacks.length) * 100;
  };

  // 🎯 Calculer le score total
  const calculerScore = async (userId: string): Promise<ScoreJulaba> => {
    // TODO: Charger depuis Supabase
    const users: any[] = [];
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) throw new Error('Utilisateur introuvable');
    
    // Calculer chaque critère
    const regularite = calculerRegularite(userId);
    const documents = calculerDocuments(userId);
    const volume = calculerVolume(userId, user.region);
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
      volumeDerniers30j: 0, // TODO: Calculer volume exact
      volumeMoyenZone: 0, // TODO
      feedbackPositifsRatio: feedback / 100,
      
      visibiliteMarketplace,
      accessCredit,
      
      evolutionScore,
      
      lastCalculatedAt: new Date().toISOString(),
    };
    
    // Sauvegarder
    setScores(new Map(scores.set(userId, scoreJulaba)));
    
    return scoreJulaba;
  };

  // 🔄 Recalculer score (appelé après chaque transaction)
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
