import React, { createContext, useContext, ReactNode } from 'react';
import { useCaisse } from './CaisseContext';
import { useRecolte } from './RecolteContext';
import { useCooperative } from './CooperativeContext';
import { useAudit } from './AuditContext';
import { useScore } from './ScoreContext';

// ========== TYPES ==========
export interface KPINational {
  volumeTotalFCFA: number; // Volume total des transactions (FCFA)
  nombreTransactions: number; // Nombre total de transactions
  nombreActeurs: number; // Nombre total d'acteurs inscrits
  tauxActivite: number; // Pourcentage d'acteurs actifs
  croissanceVolume: number; // Croissance % par rapport au mois précédent
  croissanceActeurs: number; // Croissance % du nombre d'acteurs
}

export interface StatistiquesParRole {
  marchands: {
    total: number;
    actifs: number;
    volumeVentes: number;
    nombreVentes: number;
    panierMoyen: number;
  };
  producteurs: {
    total: number;
    actifs: number;
    volumeRecoltes: number; // kg
    nombreRecoltes: number;
    prixMoyenKg: number;
  };
  cooperatives: {
    total: number;
    actives: number;
    membresTotal: number;
    tresorerieTotal: number;
    commandesGroupees: number;
  };
  identificateurs: {
    total: number;
    actifs: number;
    identificationsEffectuees: number;
    tauxValidation: number;
  };
}

export interface TopProduit {
  id: string;
  nom: string;
  categorie: string;
  volumeVentes: number; // FCFA
  nombreVentes: number;
  prixMoyen: number;
}

export interface DonneesGraphique {
  date: string;
  volumeFCFA: number;
  nombreTransactions: number;
  nouveauxActeurs: number;
}

export interface AlerteSysteme {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  titre: string;
  message: string;
  timestamp: string;
  lue: boolean;
}

interface InstitutionContextType {
  // KPIs Nationaux
  getKPINationaux: () => KPINational;
  
  // Statistiques par rôle
  getStatistiquesParRole: () => StatistiquesParRole;
  
  // Top produits
  getTopProduits: (limit?: number) => TopProduit[];
  
  // Données pour graphiques (30 derniers jours)
  getDonneesGraphique: (jours?: number) => DonneesGraphique[];
  
  // Alertes système
  getAlertes: () => AlerteSysteme[];
  marquerAlerteLue: (id: string) => void;
  
  // Audit trail
  getHistoriqueComplet: () => any[];
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

// ========== PROVIDER ==========
export function InstitutionProvider({ children }: { children: ReactNode }) {
  const caisse = useCaisse();
  const recolte = useRecolte();
  const cooperative = useCooperative();
  const audit = useAudit();
  const score = useScore();

  // ========== CALCULS KPIs NATIONAUX ==========
  const getKPINationaux = (): KPINational => {
    // ✅ NETTOYAGE PHASE 2 : Calculs basés uniquement sur données réelles des contexts
    // TODO: Récupérer les données agrégées depuis Supabase
    
    // Volume total FCFA (ventes marchands + transactions coopératives)
    const volumeMarchands = caisse?.ventes?.reduce((sum, v) => sum + v.montant, 0) || 0;
    const volumeCooperatives = cooperative?.tresorerie
      ?.filter(t => t.statut === 'validee')
      .reduce((sum, t) => (t.type === 'entree' ? sum + t.montant : sum), 0) || 0;
    const volumeTotalFCFA = volumeMarchands + volumeCooperatives;

    // Nombre total de transactions
    const nombreVentesMarchands = caisse?.ventes?.length || 0;
    const nombreTransactionsCooperatives = cooperative?.tresorerie?.filter(t => t.statut === 'validee').length || 0;
    const nombreTransactions = nombreVentesMarchands + nombreTransactionsCooperatives;

    // TODO: Charger depuis Supabase - Nombre total d'acteurs
    const nombreActeurs = 0;

    // TODO: Charger depuis Supabase - Taux d'activité
    const tauxActivite = 0;

    // TODO: Charger depuis Supabase - Croissance
    const croissanceVolume = 0;
    const croissanceActeurs = 0;

    return {
      volumeTotalFCFA,
      nombreTransactions,
      nombreActeurs,
      tauxActivite,
      croissanceVolume,
      croissanceActeurs,
    };
  };

  // ========== STATISTIQUES PAR RÔLE ==========
  const getStatistiquesParRole = (): StatistiquesParRole => {
    // ✅ NETTOYAGE PHASE 2 : Calculs basés uniquement sur données réelles
    // TODO: Récupérer les statistiques agrégées depuis Supabase
    
    // Marchands - Données réelles disponibles
    const volumeVentesMarchands = caisse?.ventes?.reduce((sum, v) => sum + v.montant, 0) || 0;
    const nombreVentesMarchands = caisse?.ventes?.length || 0;
    const panierMoyen = nombreVentesMarchands > 0 ? volumeVentesMarchands / nombreVentesMarchands : 0;

    // Producteurs - Données réelles disponibles
    const recoltes = recolte?.recoltes || [];
    const volumeRecoltes = recoltes.reduce((sum, r) => sum + r.quantite, 0);
    const nombreRecoltes = recoltes.length;
    const prixMoyenKg = nombreRecoltes > 0 
      ? recoltes.reduce((sum, r) => sum + r.prixUnitaire, 0) / nombreRecoltes 
      : 0;

    // Coopératives - Données réelles disponibles
    const membresTotal = cooperative?.membres?.length || 0;
    const tresorerieTotal = cooperative?.soldeActuel || 0;
    const commandesGroupees = cooperative?.commandesGroupees?.filter(c => c.statut === 'en_cours').length || 0;

    return {
      marchands: {
        total: 0, // TODO: Charger depuis Supabase
        actifs: 0, // TODO: Charger depuis Supabase
        volumeVentes: volumeVentesMarchands,
        nombreVentes: nombreVentesMarchands,
        panierMoyen,
      },
      producteurs: {
        total: 0, // TODO: Charger depuis Supabase
        actifs: 0, // TODO: Charger depuis Supabase
        volumeRecoltes,
        nombreRecoltes,
        prixMoyenKg,
      },
      cooperatives: {
        total: 0, // TODO: Charger depuis Supabase
        actives: 0, // TODO: Charger depuis Supabase
        membresTotal,
        tresorerieTotal,
        commandesGroupees,
      },
      identificateurs: {
        total: 0, // TODO: Charger depuis Supabase
        actifs: 0, // TODO: Charger depuis Supabase
        identificationsEffectuees: 0, // TODO: Charger depuis Supabase
        tauxValidation: 0, // TODO: Charger depuis Supabase
      },
    };
  };

  // ========== TOP PRODUITS ==========
  const getTopProduits = (limit: number = 10): TopProduit[] => {
    // ✅ NETTOYAGE PHASE 2 : Calcul basé sur données réelles uniquement
    // Agréger les produits des ventes marchands
    const produitsMap = new Map<string, { volumeVentes: number; nombreVentes: number; totalPrix: number; categorie: string }>();

    caisse?.ventes?.forEach(vente => {
      vente.articles.forEach(article => {
        const existing = produitsMap.get(article.nom);
        if (existing) {
          existing.volumeVentes += article.total;
          existing.nombreVentes += article.quantite;
          existing.totalPrix += article.prixUnitaire * article.quantite;
        } else {
          produitsMap.set(article.nom, {
            volumeVentes: article.total,
            nombreVentes: article.quantite,
            totalPrix: article.prixUnitaire * article.quantite,
            categorie: article.categorie || 'Autre',
          });
        }
      });
    });

    // Convertir en tableau et trier par volume
    const topProduits: TopProduit[] = Array.from(produitsMap.entries())
      .map(([nom, data]) => ({
        id: nom,
        nom,
        categorie: data.categorie,
        volumeVentes: data.volumeVentes,
        nombreVentes: data.nombreVentes,
        prixMoyen: data.nombreVentes > 0 ? data.totalPrix / data.nombreVentes : 0,
      }))
      .sort((a, b) => b.volumeVentes - a.volumeVentes)
      .slice(0, limit);

    return topProduits;
  };

  // ========== DONNÉES GRAPHIQUE ==========
  const getDonneesGraphique = (jours: number = 30): DonneesGraphique[] => {
    // ✅ NETTOYAGE PHASE 2 : Suppression des données mock aléatoires
    // TODO: Charger l'historique réel depuis Supabase
    // Pour l'instant, retourne un tableau vide
    return [];
  };

  // ========== ALERTES SYSTÈME ==========
  const getAlertes = (): AlerteSysteme[] => {
    // ✅ NETTOYAGE PHASE 2 : Suppression des alertes mock hardcodées
    // TODO: Charger les alertes réelles depuis Supabase
    return [];
  };

  const marquerAlerteLue = (id: string) => {
    // TODO: Mettre à jour dans Supabase
  };

  // ========== HISTORIQUE COMPLET ==========
  const getHistoriqueComplet = () => {
    return audit?.logs || [];
  };

  const value: InstitutionContextType = {
    getKPINationaux,
    getStatistiquesParRole,
    getTopProduits,
    getDonneesGraphique,
    getAlertes,
    marquerAlerteLue,
    getHistoriqueComplet,
  };

  return (
    <InstitutionContext.Provider value={value}>
      {children}
    </InstitutionContext.Provider>
  );
}

// ========== HOOK ==========
export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error('useInstitution doit être utilisé dans un InstitutionProvider');
  }
  return context;
}
