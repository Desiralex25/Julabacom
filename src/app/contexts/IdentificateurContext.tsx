import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useZones } from './ZoneContext';

export type StatutIdentification = 'en_cours' | 'valide' | 'rejete';
export type TypeActeur = 'marchand' | 'producteur';

export interface Identification {
  id: string;
  identificateurId: string;
  identificateurNom: string;
  typeActeur: TypeActeur;
  
  // Informations acteur
  nom: string;
  prenoms: string;
  telephone: string;
  dateNaissance?: string;
  zone: string; // Zone d'attribution
  zoneId: string;
  
  // Informations activité
  activite: string;
  marche?: string; // Pour les marchands
  village?: string; // Pour les producteurs
  
  // Informations administratives
  cni?: string;
  photo?: string;
  
  // Statut et suivi
  statut: StatutIdentification;
  dateIdentification: string;
  dateValidation?: string;
  
  // Commissions
  commission: number;
  commissionPayee: boolean;
  dateCommission?: string;
  
  // Institution
  validePar?: string; // ID institution
  raisonRejet?: string;
  
  // Modification
  derniereMaj?: string;
  modifiePar?: string[];
}

export interface Commission {
  id: string;
  identificateurId: string;
  identificationId: string;
  typeActeur: TypeActeur;
  montant: number;
  acteurNom: string;
  dateVersement: string;
  mois: string; // Pour regroupement mensuel
}

export interface MissionIdentification {
  id: string;
  institutionId: string;
  zoneId: string;
  zoneNom: string;
  typeActeur: TypeActeur;
  objectif: number; // Nombre d'identifications demandées
  recompense: number; // Prime additionnelle
  dateDebut: string;
  dateFin: string;
  statut: 'active' | 'terminee' | 'annulee';
  description: string;
}

export interface DemandeMutation {
  id: string;
  identificateurId: string;
  identificateurNom: string;
  zoneActuelle: string;
  zoneActuelleId: string;
  zoneDemandee: string;
  zoneDemandeeId: string;
  raison: string;
  dateDemande: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  dateTraitement?: string;
  traitePar?: string;
  commentaireInstitution?: string;
}

export interface StatsIdentificateur {
  totalIdentifications: number;
  identificationsValides: number;
  identificationsEnCours: number;
  identificationsRejetees: number;
  totalCommissions: number;
  commissionsMoisEnCours: number;
  tauxValidation: number;
  rangZone: number; // Classement dans sa zone
  meilleursJours: { jour: string; nombre: number }[];
}

interface IdentificateurContextType {
  // Identifications
  identifications: Identification[];
  addIdentification: (data: Omit<Identification, 'id' | 'dateIdentification' | 'statut' | 'commissionPayee'>) => void;
  updateIdentification: (id: string, updates: Partial<Identification>) => void;
  getIdentificationsByZone: (zoneId: string) => Identification[];
  getMesIdentifications: () => Identification[];
  getRecentIdentifications: (limit?: number) => Identification[];
  
  // Vérification accès
  peutConsulterActeur: (acteurZoneId: string) => { autorise: boolean; raison?: string };
  peutModifierActeur: (acteurZoneId: string) => boolean;
  
  // Recherche
  rechercherParNumero: (numero: string) => {
    acteur: Identification | null;
    consultable: boolean;
    zone: string;
  };
  
  // Commissions
  commissions: Commission[];
  getCommissionsMois: (mois: string) => Commission[];
  getTotalCommissions: () => number;
  
  // Missions
  missions: MissionIdentification[];
  getMissionsActives: () => MissionIdentification[];
  getMissionsZone: (zoneId: string) => MissionIdentification[];
  
  // Mutations
  demandes: DemandeMutation[];
  demanderMutation: (data: Omit<DemandeMutation, 'id' | 'dateDemande' | 'statut'>) => void;
  getMesDemandes: () => DemandeMutation[];
  
  // Stats
  stats: {
    identificationsTotal: number;
    commissionsTotal: number;
  };
  getStatsIdentificateur: (identificateurId: string) => StatsIdentificateur;
}

const IdentificateurContext = createContext<IdentificateurContextType | undefined>(undefined);

const IDENTIFICATIONS_KEY = 'julaba_identifications';
const COMMISSIONS_KEY = 'julaba_commissions';
const MISSIONS_KEY = 'julaba_missions';
const DEMANDES_KEY = 'julaba_demandes_mutation';

// ✅ MOCK DATA SUPPRIMÉS - Migration Supabase

export function IdentificateurProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { getZoneById } = useZones();

  const [identifications, setIdentifications] = useState<Identification[]>([]);
  
  // TODO: Charger depuis Supabase au mount
  // useEffect(() => {
  //   const loadData = async () => {
  //     const { data } = await supabase.from('identifications').select('*');
  //     setIdentifications(data || []);
  //   };
  //   loadData();
  // }, []);

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [missions, setMissions] = useState<MissionIdentification[]>([]);
  const [demandes, setDemandes] = useState<DemandeMutation[]>([]);

  // TODO: Auto-save vers Supabase
  // ✅ localStorage SUPPRIMÉ

  const addIdentification = (data: Omit<Identification, 'id' | 'dateIdentification' | 'statut' | 'commissionPayee'>) => {
    const newIdentification: Identification = {
      ...data,
      id: `ID-${Date.now()}`,
      dateIdentification: new Date().toISOString().split('T')[0],
      statut: 'valide', // Création automatique - pas de validation
      commissionPayee: false,
    };

    setIdentifications(prev => [...prev, newIdentification]);

    // Créer la commission immédiatement (versement différé)
    const commission: Commission = {
      id: `COM-${Date.now()}`,
      identificateurId: data.identificateurId,
      identificationId: newIdentification.id,
      typeActeur: data.typeActeur,
      montant: data.commission,
      acteurNom: `${data.prenoms} ${data.nom}`,
      dateVersement: new Date().toISOString().split('T')[0],
      mois: new Date().toISOString().slice(0, 7), // YYYY-MM
    };
    setCommissions(prev => [...prev, commission]);

    return newIdentification;
  };

  const updateIdentification = (id: string, updates: Partial<Identification>) => {
    setIdentifications(prev => prev.map(ident => 
      ident.id === id 
        ? { 
            ...ident, 
            ...updates, 
            derniereMaj: new Date().toISOString(),
            modifiePar: [...(ident.modifiePar || []), user?.telephone || 'unknown']
          } 
        : ident
    ));
  };

  const getIdentificationsByZone = (zoneId: string) => {
    return identifications.filter(ident => ident.zoneId === zoneId);
  };

  const getMesIdentifications = () => {
    if (!user) return [];
    // Pour Identificateur : seulement sa zone
    if (user.role === 'identificateur') {
      const userZoneId = (user as any).zoneAttribueeId;
      return identifications.filter(ident => ident.zoneId === userZoneId);
    }
    // Pour Institution : tout voir
    if (user.role === 'institution') {
      return identifications;
    }
    return [];
  };

  const getRecentIdentifications = (limit?: number) => {
    const sortedIdentifications = identifications.sort((a, b) => new Date(b.dateIdentification).getTime() - new Date(a.dateIdentification).getTime());
    return limit ? sortedIdentifications.slice(0, limit) : sortedIdentifications;
  };

  const peutConsulterActeur = (acteurZoneId: string): { autorise: boolean; raison?: string } => {
    if (!user) return { autorise: false, raison: 'Non authentifié' };
    
    // Institution voit tout
    if (user.role === 'institution') {
      return { autorise: true };
    }

    // Identificateur limité à sa zone
    if (user.role === 'identificateur') {
      const userZoneId = (user as any).zoneAttribueeId;
      if (acteurZoneId === userZoneId) {
        return { autorise: true };
      }
      const zone = getZoneById(acteurZoneId);
      return { 
        autorise: false, 
        raison: `Cet acteur n'est pas attribué à votre zone (${zone?.nom || 'Zone inconnue'})` 
      };
    }

    return { autorise: false, raison: 'Accès non autorisé' };
  };

  const peutModifierActeur = (acteurZoneId: string) => {
    // Même logique mais retourne boolean simple
    const result = peutConsulterActeur(acteurZoneId);
    return result.autorise;
  };

  const rechercherParNumero = (numero: string) => {
    const acteur = identifications.find(ident => 
      ident.telephone.includes(numero.replace(/\s/g, ''))
    );

    if (!acteur) {
      return { acteur: null, consultable: false, zone: '' };
    }

    const access = peutConsulterActeur(acteur.zoneId);
    return {
      acteur,
      consultable: access.autorise,
      zone: acteur.zone,
    };
  };

  const getCommissionsMois = (mois: string) => {
    if (!user) return [];
    return commissions.filter(
      com => com.identificateurId === user.telephone && com.mois === mois
    );
  };

  const getTotalCommissions = () => {
    if (!user) return 0;
    return commissions
      .filter(com => com.identificateurId === user.telephone)
      .reduce((sum, com) => sum + com.montant, 0);
  };

  const getMissionsActives = () => {
    return missions.filter(m => m.statut === 'active');
  };

  const getMissionsZone = (zoneId: string) => {
    return missions.filter(m => m.zoneId === zoneId && m.statut === 'active');
  };

  const demanderMutation = (data: Omit<DemandeMutation, 'id' | 'dateDemande' | 'statut'>) => {
    const demande: DemandeMutation = {
      ...data,
      id: `MUT-${Date.now()}`,
      dateDemande: new Date().toISOString().split('T')[0],
      statut: 'en_attente',
    };
    setDemandes(prev => [...prev, demande]);
  };

  const getMesDemandes = () => {
    if (!user) return [];
    return demandes.filter(d => d.identificateurId === user.telephone);
  };

  const getStatsIdentificateur = (identificateurId: string): StatsIdentificateur => {
    const mesIdentifs = identifications.filter(i => i.identificateurId === identificateurId);
    const mesCommissions = commissions.filter(c => c.identificateurId === identificateurId);

    const moisActuel = new Date().toISOString().slice(0, 7);
    const commissionsMois = mesCommissions.filter(c => c.mois === moisActuel);

    const valides = mesIdentifs.filter(i => i.statut === 'valide').length;
    const enCours = mesIdentifs.filter(i => i.statut === 'en_cours').length;
    const rejetes = mesIdentifs.filter(i => i.statut === 'rejete').length;

    return {
      totalIdentifications: mesIdentifs.length,
      identificationsValides: valides,
      identificationsEnCours: enCours,
      identificationsRejetees: rejetes,
      totalCommissions: mesCommissions.reduce((s, c) => s + c.montant, 0),
      commissionsMoisEnCours: commissionsMois.reduce((s, c) => s + c.montant, 0),
      tauxValidation: mesIdentifs.length > 0 ? (valides / mesIdentifs.length) * 100 : 0,
      rangZone: 1, // TODO: Calculer rang réel
      meilleursJours: [], // TODO: Analyser par jour
    };
  };

  return (
    <IdentificateurContext.Provider
      value={{
        identifications,
        addIdentification,
        updateIdentification,
        getIdentificationsByZone,
        getMesIdentifications,
        getRecentIdentifications,
        peutConsulterActeur,
        peutModifierActeur,
        rechercherParNumero,
        commissions,
        getCommissionsMois,
        getTotalCommissions,
        missions,
        getMissionsActives,
        getMissionsZone,
        demandes,
        demanderMutation,
        getMesDemandes,
        stats: {
          identificationsTotal: identifications.length,
          commissionsTotal: commissions.reduce((s, c) => s + c.montant, 0),
        },
        getStatsIdentificateur,
      }}
    >
      {children}
    </IdentificateurContext.Provider>
  );
}

export function useIdentificateur() {
  const context = useContext(IdentificateurContext);
  if (!context) {
    throw new Error('useIdentificateur must be used within IdentificateurProvider');
  }
  return context;
}