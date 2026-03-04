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

    // Nombre total d'acteurs (mock pour l'instant)
    const nombreMarchands = 1247;
    const nombreProducteurs = 3589;
    const nombreCooperatives = 156;
    const nombreIdentificateurs = 42;
    const nombreActeurs = nombreMarchands + nombreProducteurs + nombreCooperatives + nombreIdentificateurs;

    // Taux d'activité (mock)
    const tauxActivite = 78.5;

    // Croissance (mock - devrait être calculé sur historique)
    const croissanceVolume = 12.3;
    const croissanceActeurs = 8.7;

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
    // Marchands
    const volumeVentesMarchands = caisse?.ventes?.reduce((sum, v) => sum + v.montant, 0) || 0;
    const nombreVentesMarchands = caisse?.ventes?.length || 0;
    const panierMoyen = nombreVentesMarchands > 0 ? volumeVentesMarchands / nombreVentesMarchands : 0;

    // Producteurs
    const recoltes = recolte?.recoltes || [];
    const volumeRecoltes = recoltes.reduce((sum, r) => sum + r.quantite, 0);
    const nombreRecoltes = recoltes.length;
    const prixMoyenKg = nombreRecoltes > 0 
      ? recoltes.reduce((sum, r) => sum + r.prixUnitaire, 0) / nombreRecoltes 
      : 0;

    // Coopératives
    const membresTotal = cooperative?.membres?.length || 0;
    const tresorerieTotal = cooperative?.soldeActuel || 0;
    const commandesGroupees = cooperative?.commandesGroupees?.filter(c => c.statut === 'en_cours').length || 0;

    return {
      marchands: {
        total: 1247,
        actifs: 982,
        volumeVentes: volumeVentesMarchands,
        nombreVentes: nombreVentesMarchands,
        panierMoyen,
      },
      producteurs: {
        total: 3589,
        actifs: 2845,
        volumeRecoltes,
        nombreRecoltes,
        prixMoyenKg,
      },
      cooperatives: {
        total: 156,
        actives: 124,
        membresTotal,
        tresorerieTotal,
        commandesGroupees,
      },
      identificateurs: {
        total: 42,
        actifs: 38,
        identificationsEffectuees: 1247,
        tauxValidation: 94.2,
      },
    };
  };

  // ========== TOP PRODUITS ==========
  const getTopProduits = (limit: number = 10): TopProduit[] => {
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
    // Générer des données mock pour les 30 derniers jours
    const donnees: DonneesGraphique[] = [];
    const aujourdhui = new Date();

    for (let i = jours - 1; i >= 0; i--) {
      const date = new Date(aujourdhui);
      date.setDate(date.getDate() - i);

      // Générer des valeurs réalistes avec tendance croissante et variations
      const baseVolume = 5000000 + (jours - i) * 150000;
      const variation = Math.random() * 1000000 - 500000;
      const volumeFCFA = Math.max(0, baseVolume + variation);

      const baseTransactions = 450 + (jours - i) * 15;
      const variationTrans = Math.random() * 100 - 50;
      const nombreTransactions = Math.max(0, Math.round(baseTransactions + variationTrans));

      const nouveauxActeurs = Math.round(Math.random() * 50 + 10);

      donnees.push({
        date: date.toISOString().split('T')[0],
        volumeFCFA,
        nombreTransactions,
        nouveauxActeurs,
      });
    }

    return donnees;
  };

  // ========== ALERTES SYSTÈME ==========
  const getAlertes = (): AlerteSysteme[] => {
    const alertes: AlerteSysteme[] = [
      {
        id: '1',
        type: 'success',
        titre: 'Objectif mensuel atteint',
        message: 'Le volume de transactions a dépassé 150M FCFA ce mois-ci',
        timestamp: new Date().toISOString(),
        lue: false,
      },
      {
        id: '2',
        type: 'info',
        titre: 'Nouvelle coopérative enregistrée',
        message: 'La coopérative "Union des Producteurs de Yamoussoukro" a rejoint JULABA',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        lue: false,
      },
      {
        id: '3',
        type: 'warning',
        titre: 'Anomalie détectée',
        message: 'Volume de ventes anormalement bas dans la région de Korhogo',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        lue: true,
      },
      {
        id: '4',
        type: 'info',
        titre: 'Rapport hebdomadaire disponible',
        message: 'Le rapport d\'activité de la semaine dernière est prêt à être consulté',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        lue: true,
      },
    ];

    return alertes;
  };

  const marquerAlerteLue = (id: string) => {
    // Dans une vraie app, ceci mettrait à jour le backend
    console.log(`Alerte ${id} marquée comme lue`);
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