import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as identificationsApi from '../../imports/identifications-api';
import * as commissionsApi from '../../imports/commissions-api';
import * as missionsApi from '../../imports/missions-api';
import { NOT_AUTHENTICATED } from '../../imports/api-client';
import { ACTEURS_DATA } from '../data/acteursData';

export interface Identification {
  id: string;
  acteurId: string;
  typeActeur: 'marchand' | 'producteur' | 'cooperative' | 'institution';
  statut: 'en_attente' | 'validee' | 'rejetee' | 'draft' | 'en_cours' | 'valide' | 'rejete';
  documents?: any;
  zoneId?: string;
  zone?: string;
  commission?: number;
  commissionPayee: boolean;
  dateIdentification: string;
  telephone: string;
  nom: string;
  prenoms: string;
  activite: string;
  commune: string;
}

export interface Commission {
  id: string;
  montant: number;
  statut: 'en_attente' | 'validee' | 'payee';
  periode?: string;
  datePaiement?: string;
}

export interface Mission {
  id: string;
  titre: string;
  description?: string;
  zoneId?: string;
  objectif?: number;
  progres: number;
  statut: 'en_cours' | 'terminee' | 'annulee';
  dateDebut?: string;
  dateFin?: string;
  recompense?: number;
}

interface IdentificateurContextType {
  identifications: Identification[];
  commissions: Commission[];
  missions: Mission[];
  loading: boolean;
  
  addIdentification: (data: Omit<Identification, 'id' | 'statut' | 'commissionPayee'>) => Promise<void>;
  updateMissionProgress: (id: string, progres: number) => Promise<void>;
  
  getIdentificationsByStatut: (statut: Identification['statut']) => Identification[];
  getCommissionsStats: () => Promise<any>;
  
  refreshIdentifications: () => Promise<void>;
  refreshCommissions: () => Promise<void>;
  refreshMissions: () => Promise<void>;
  
  // Nouvelles fonctions pour les données mock
  getMesIdentifications: () => Identification[];
  rechercherParNumero: (numero: string) => { acteur: any | null; zone: string; consultable: boolean };
  peutConsulterActeur: (zoneId?: string) => { autorise: boolean; raison?: string };
  getTotalCommissions: () => number;
  getStatsIdentificateur: (identificateurId: string) => any;
  getMissionsActives: () => Mission[];
}

const IdentificateurContext = createContext<IdentificateurContextType | undefined>(undefined);

export function IdentificateurProvider({ children }: { children: ReactNode }) {
  // Données mock basées sur ACTEURS_DATA avec dates variées
  const mockIdentificationsData: Identification[] = ACTEURS_DATA.map((acteur, index) => ({
    id: acteur.id,
    acteurId: acteur.id,
    typeActeur: acteur.role as 'marchand' | 'producteur' | 'cooperative',
    statut: acteur.statut === 'approved' ? 'valide' : acteur.statut === 'rejected' ? 'rejete' : acteur.statut === 'soumis' ? 'en_cours' : 'draft',
    documents: acteur.documents,
    zoneId: acteur.commune,
    zone: acteur.marche,
    commission: index % 3 === 0 ? 5000 : index % 2 === 0 ? 7500 : 10000,
    commissionPayee: acteur.statut === 'approved',
    dateIdentification: acteur.dateIdentification,
    telephone: acteur.telephone,
    nom: acteur.nom,
    prenoms: acteur.prenoms,
    activite: acteur.activite,
    commune: acteur.commune,
  }));

  const [identifications, setIdentifications] = useState<Identification[]>(mockIdentificationsData);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIdentifications = async () => {
    try {
      const { identifications: data } = await identificationsApi.fetchIdentifications();
      
      if (data && Array.isArray(data)) {
        setIdentifications(data.map((i: any) => ({
          id: i.id,
          acteurId: i.acteur_id,
          typeActeur: i.type_acteur,
          statut: i.statut,
          documents: i.documents,
          zoneId: i.zone_id,
          zone: i.zone,
          commission: i.commission,
          commissionPayee: i.commission_payee,
          dateIdentification: i.date_identification,
          telephone: i.telephone,
          nom: i.nom,
          prenoms: i.prenoms,
          activite: i.activite,
          commune: i.commune,
        })));
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) return;
      console.error('Error loading identifications:', error);
    }
  };

  const loadCommissions = async () => {
    try {
      const { commissions: data } = await commissionsApi.fetchCommissions();
      
      if (data && Array.isArray(data)) {
        setCommissions(data.map((c: any) => ({
          id: c.id,
          montant: c.montant,
          statut: c.statut,
          periode: c.periode,
          datePaiement: c.date_paiement,
        })));
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) return;
      console.error('Error loading commissions:', error);
    }
  };

  const loadMissions = async () => {
    try {
      const { missions: data } = await missionsApi.fetchMissions();
      
      if (data && Array.isArray(data)) {
        setMissions(data.map((m: any) => ({
          id: m.id,
          titre: m.titre,
          description: m.description,
          zoneId: m.zone_id,
          objectif: m.objectif,
          progres: m.progres,
          statut: m.statut,
          dateDebut: m.date_debut,
          dateFin: m.date_fin,
          recompense: m.recompense,
        })));
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      // Ignorer silencieusement les erreurs JWT en mode demo
      if (error?.message?.includes('Invalid JWT') || error?.message?.includes('JWT')) return;
      console.error('Error loading missions:', error);
    }
  };

  useEffect(() => {
    Promise.all([
      loadIdentifications(),
      loadCommissions(),
      loadMissions(),
    ]);
  }, []);

  const addIdentification = async (
    data: Omit<Identification, 'id' | 'statut' | 'commissionPayee'>
  ) => {
    try {
      await identificationsApi.createIdentification({
        acteur_id: data.acteurId,
        type_acteur: data.typeActeur,
        documents: data.documents,
        zone_id: data.zoneId,
        commission: data.commission,
        date_identification: data.dateIdentification,
        telephone: data.telephone,
        nom: data.nom,
        prenoms: data.prenoms,
        activite: data.activite,
        commune: data.commune,
      });
      await loadIdentifications();
      await loadCommissions();
    } catch (error) {
      console.error('Error adding identification:', error);
      throw error;
    }
  };

  const updateMissionProgress = async (id: string, progres: number) => {
    try {
      await missionsApi.updateMissionProgres(id, progres);
      await loadMissions();
    } catch (error) {
      console.error('Error updating mission progress:', error);
      throw error;
    }
  };

  const getIdentificationsByStatut = (statut: Identification['statut']) => {
    return identifications.filter(i => i.statut === statut);
  };

  const getCommissionsStats = async () => {
    try {
      const { stats } = await commissionsApi.fetchCommissionsStats();
      return stats;
    } catch (error) {
      console.error('Error loading commissions stats:', error);
      return null;
    }
  };

  const refreshIdentifications = async () => {
    await loadIdentifications();
  };

  const refreshCommissions = async () => {
    await loadCommissions();
  };

  const refreshMissions = async () => {
    await loadMissions();
  };

  // Nouvelles fonctions pour les données mock
  const getMesIdentifications = () => {
    return identifications;
  };

  const rechercherParNumero = (numero: string) => {
    const acteur = ACTEURS_DATA.find(a => a.telephone === numero);
    const zone = acteur ? acteur.marche : '';
    const consultable = !!acteur;
    return { acteur, zone, consultable };
  };

  const peutConsulterActeur = (zoneId?: string) => {
    const autorise = !!zoneId;
    const raison = autorise ? undefined : 'Zone non spécifiée';
    return { autorise, raison };
  };

  const getTotalCommissions = () => {
    return commissions.reduce((total, c) => total + c.montant, 0);
  };

  const getStatsIdentificateur = (identificateurId: string) => {
    // Pour les données mock, on retourne les stats globales
    const totalIdentifications = identifications.length;
    const identificationsValidees = identifications.filter(i => i.statut === 'valide' || i.statut === 'validee').length;
    const identificationsRejetees = identifications.filter(i => i.statut === 'rejete' || i.statut === 'rejetee').length;
    return {
      totalIdentifications,
      identificationsValidees,
      identificationsRejetees,
    };
  };

  const getMissionsActives = () => {
    return missions.filter(m => m.statut === 'en_cours');
  };

  const value: IdentificateurContextType = {
    identifications,
    commissions,
    missions,
    loading,
    addIdentification,
    updateMissionProgress,
    getIdentificationsByStatut,
    getCommissionsStats,
    refreshIdentifications,
    refreshCommissions,
    refreshMissions,
    // Nouvelles fonctions pour les données mock
    getMesIdentifications,
    rechercherParNumero,
    peutConsulterActeur,
    getTotalCommissions,
    getStatsIdentificateur,
    getMissionsActives,
  };

  return <IdentificateurContext.Provider value={value}>{children}</IdentificateurContext.Provider>;
}

export function useIdentificateur() {
  const context = useContext(IdentificateurContext);
  if (!context) {
    throw new Error('useIdentificateur must be used within IdentificateurProvider');
  }
  return context;
}