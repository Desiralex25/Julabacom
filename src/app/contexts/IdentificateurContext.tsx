import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as identificationsApi from '../../imports/identifications-api';
import * as commissionsApi from '../../imports/commissions-api';
import * as missionsApi from '../../imports/missions-api';
import { DEV_MODE, devLog } from '../config/devMode';

export interface Identification {
  id: string;
  acteurId: string;
  typeActeur: 'marchand' | 'producteur' | 'cooperative' | 'institution';
  statut: 'en_attente' | 'validee' | 'rejetee';
  documents?: any;
  zoneId?: string;
  commission?: number;
  commissionPayee: boolean;
  dateIdentification: string;
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
}

const IdentificateurContext = createContext<IdentificateurContextType | undefined>(undefined);

export function IdentificateurProvider({ children }: { children: ReactNode }) {
  const [identifications, setIdentifications] = useState<Identification[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIdentifications = async () => {
    if (DEV_MODE) {
      devLog('IdentificateurContext', 'Mode dev - skip loadIdentifications');
      return;
    }
    try {
      const { identifications: data } = await identificationsApi.fetchIdentifications();
      
      setIdentifications(data.map((i: any) => ({
        id: i.id,
        acteurId: i.acteur_id,
        typeActeur: i.type_acteur,
        statut: i.statut,
        documents: i.documents,
        zoneId: i.zone_id,
        commission: i.commission,
        commissionPayee: i.commission_payee,
        dateIdentification: i.date_identification,
      })));
    } catch (error) {
      console.error('Error loading identifications:', error);
    }
  };

  const loadCommissions = async () => {
    if (DEV_MODE) {
      devLog('IdentificateurContext', 'Mode dev - skip loadCommissions');
      return;
    }
    try {
      const { commissions: data } = await commissionsApi.fetchCommissions();
      
      setCommissions(data.map((c: any) => ({
        id: c.id,
        montant: c.montant,
        statut: c.statut,
        periode: c.periode,
        datePaiement: c.date_paiement,
      })));
    } catch (error) {
      console.error('Error loading commissions:', error);
    }
  };

  const loadMissions = async () => {
    if (DEV_MODE) {
      devLog('IdentificateurContext', 'Mode dev - skip loadMissions');
      return;
    }
    try {
      const { missions: data } = await missionsApi.fetchMissions();
      
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
    } catch (error) {
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