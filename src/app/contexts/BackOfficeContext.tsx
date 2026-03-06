import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as boAPI from '/src/imports/backoffice-api';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient';

// ─── Types ──────────────────────────────────────────────────────────────────

export type BORoleType = 'super_admin' | 'admin_national' | 'gestionnaire_zone' | 'analyste';

// ─── Institution BO ──────────────────────────────────────────────────────────

export type NiveauAcces = 'aucun' | 'lecture' | 'complet';

export interface ModuleAcces {
  dashboard: NiveauAcces;
  analytics: NiveauAcces;
  acteurs: NiveauAcces;
  supervision: NiveauAcces;
  audit: NiveauAcces;
  export: NiveauAcces;
}

export type TypeInstitution = 'cnps' | 'bni' | 'ministere' | 'anader' | 'ong' | 'autre';

export interface InstitutionBO {
  id: string;
  nom: string;
  type: TypeInstitution;
  region: string;
  email: string;
  referentNom: string;
  referentTelephone: string;
  statut: 'actif' | 'suspendu';
  dateCreation: string;
  modules: ModuleAcces;
  creePar: string;
}

export interface BOUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: BORoleType;
  region?: string;
  avatar?: string;
  lastLogin: string;
  actif: boolean;
}

export interface BOActeur {
  id: string;
  nom: string;
  prenoms: string;
  telephone: string;
  type: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
  region: string;
  commune: string;
  statut: 'actif' | 'suspendu' | 'en_attente' | 'rejete';
  dateInscription: string;
  score: number;
  transactionsTotal: number;
  volumeTotal: number;
  validated: boolean;
  identificateurId?: string;
  zone?: string;
  activite?: string;
  email?: string;
  cni?: string;
}

export interface BODossier {
  id: string;
  acteurId: string;
  acteurNom: string;
  acteurType: BOActeur['type'];
  statut: 'draft' | 'pending' | 'approved' | 'rejected' | 'complement';
  dateCreation: string;
  dateModification: string;
  identificateurNom: string;
  region: string;
  motifRejet?: string;
  documents: string[];
}

export interface BOTransaction {
  id: string;
  acteurNom: string;
  acteurType: string;
  produit: string;
  quantite: string;
  montant: number;
  commission: number;
  statut: 'validee' | 'en_cours' | 'gelee' | 'annulee' | 'litige';
  date: string;
  region: string;
  modePaiement: string;
}

export interface BOZone {
  id: string;
  nom: string;
  region: string;
  gestionnaire?: string;
  nbActeurs: number;
  nbIdentificateurs: number;
  volumeTotal: number;
  tauxActivite: number;
  statut: 'active' | 'inactive';
}

export interface BOCommission {
  id: string;
  identificateurNom: string;
  periode: string;
  nbDossiers: number;
  montantTotal: number;
  statut: 'en_attente' | 'payee' | 'validee';
  date: string;
}

export interface BOAuditLog {
  id: string;
  action: string;
  utilisateurBO: string;
  roleBO: BORoleType;
  acteurImpacte?: string;
  ancienneValeur?: string;
  nouvelleValeur?: string;
  date: string;
  ip: string;
  module: string;
}

// ─── Mock BO Users (pour développement uniquement) ──────────────────────────

export const MOCK_BO_USERS: BOUser[] = [
  {
    id: 'bo1',
    nom: 'KONÉ',
    prenom: 'Amadou',
    email: 'amadou.kone@julaba.ci',
    role: 'super_admin',
    avatar: undefined,
    lastLogin: new Date().toISOString(),
    actif: true,
  },
  {
    id: 'bo2',
    nom: 'TOURÉ',
    prenom: 'Aminata',
    email: 'aminata.toure@julaba.ci',
    role: 'admin_national',
    avatar: undefined,
    lastLogin: new Date().toISOString(),
    actif: true,
  },
  {
    id: 'bo3',
    nom: 'YAO',
    prenom: 'Jean',
    email: 'jean.yao@julaba.ci',
    role: 'gestionnaire_zone',
    region: 'Abidjan',
    avatar: undefined,
    lastLogin: new Date().toISOString(),
    actif: true,
  },
  {
    id: 'bo4',
    nom: 'DIABATÉ',
    prenom: 'Mariam',
    email: 'mariam.diabate@julaba.ci',
    role: 'analyste',
    avatar: undefined,
    lastLogin: new Date().toISOString(),
    actif: true,
  },
];

// ─── Permissions RBAC ───────────────────────────────────────────────────────

export const PERMISSIONS: Record<BORoleType, string[]> = {
  super_admin: [
    'acteurs.read', 'acteurs.write', 'acteurs.delete', 'acteurs.suspend',
    'enrolement.read', 'enrolement.write', 'enrolement.validate',
    'supervision.read', 'supervision.write', 'supervision.freeze',
    'zones.read', 'zones.write',
    'commissions.read', 'commissions.write', 'commissions.pay',
    'academy.read', 'academy.write',
    'missions.read', 'missions.write',
    'parametres.read', 'parametres.write',
    'audit.read',
    'utilisateurs.read', 'utilisateurs.write', 'utilisateurs.delete',
  ],
  admin_national: [
    'acteurs.read', 'acteurs.write', 'acteurs.suspend',
    'enrolement.read', 'enrolement.write', 'enrolement.validate',
    'supervision.read', 'supervision.write',
    'zones.read',
    'commissions.read', 'commissions.write',
    'academy.read',
    'missions.read', 'missions.write',
    'audit.read',
    'utilisateurs.read',
  ],
  gestionnaire_zone: [
    'acteurs.read', 'acteurs.write',
    'enrolement.read', 'enrolement.validate',
    'supervision.read',
    'zones.read',
    'commissions.read',
    'missions.read',
    'audit.read',
  ],
  analyste: [
    'acteurs.read',
    'supervision.read',
    'zones.read',
    'commissions.read',
    'audit.read',
  ],
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface BackOfficeContextType {
  boUser: BOUser | null;
  setBOUser: (user: BOUser | null) => void;
  hasPermission: (permission: string) => boolean;

  acteurs: BOActeur[];
  dossiers: BODossier[];
  transactions: BOTransaction[];
  zones: BOZone[];
  commissions: BOCommission[];
  auditLogs: BOAuditLog[];
  boUsers: BOUser[];
  institutions: InstitutionBO[];
  missions: any[];

  updateActeurStatut: (id: string, statut: BOActeur['statut'], log?: string) => void;
  updateDossierStatut: (id: string, statut: BODossier['statut'], motif?: string) => void;
  updateZoneStatut: (id: string, statut: BOZone['statut']) => void;
  addZone: (data: { nom: string; region: string; gestionnaire?: string }) => Promise<void>;
  updateZoneData: (id: string, data: { nom?: string; region?: string; gestionnaire?: string }) => Promise<void>;
  updateCommissionStatut: (id: string, statut: BOCommission['statut']) => void;
  addAuditLog: (log: Omit<BOAuditLog, 'id' | 'date'>) => void;
  addBOUser: (user: { prenom: string; nom: string; email: string; password: string; role: BORoleType; region?: string }) => Promise<void>;
  updateBOUserActif: (id: string, actif: boolean) => Promise<void>;
  addInstitution: (inst: Omit<InstitutionBO, 'id' | 'dateCreation' | 'creePar'>) => void;
  updateInstitutionModules: (id: string, modules: ModuleAcces) => void;
  updateInstitutionStatut: (id: string, statut: InstitutionBO['statut']) => void;
  deleteInstitution: (id: string) => void;
  addMission: (data: any) => Promise<void>;
  updateMissionStatut: (id: string, statut: string) => Promise<void>;
  createIdentificateur: (data: { prenom: string; nom: string; telephone: string; cni?: string; region?: string; zoneId?: string; objectifMensuel?: string; institutionRattachee?: string }) => Promise<void>;
}

const BackOfficeContext = createContext<BackOfficeContextType | null>(null);

export function BackOfficeProvider({ children }: { children: ReactNode }) {
  // ✅ PERSISTANCE BO : Restaurer depuis Supabase session au démarrage
  // Le boUser est stocké en localStorage uniquement comme cache UI — le token Supabase fait foi
  const [boUser, setBOUser] = useState<BOUser | null>(() => {
    const stored = localStorage.getItem('julaba_bo_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('julaba_bo_user');
      return null;
    }
  });

  // Vérifier la session Supabase au démarrage — si pas de session, on nettoie boUser
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setBOUser(null);
        localStorage.removeItem('julaba_bo_user');
      }
    }).catch((e) => console.warn('[BO] Erreur vérification session Supabase:', e));
  }, []);
  
  // ✅ Sauvegarder boUser dans localStorage quand il change
  React.useEffect(() => {
    if (boUser) {
      localStorage.setItem('julaba_bo_user', JSON.stringify(boUser));
    } else {
      localStorage.removeItem('julaba_bo_user');
    }
  }, [boUser]);
  
  // ✅ SUPABASE MIGRATION COMPLETE : Toutes les données chargées depuis Supabase
  const [acteurs, setActeurs] = useState<BOActeur[]>([]);
  const [dossiers, setDossiers] = useState<BODossier[]>([]);
  const [transactions, setTransactions] = useState<BOTransaction[]>([]);
  const [zones, setZones] = useState<BOZone[]>([]);
  const [commissions, setCommissions] = useState<BOCommission[]>([]);
  const [auditLogs, setAuditLogs] = useState<BOAuditLog[]>([]);
  const [boUsers, setBOUsers] = useState<BOUser[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionBO[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Charger toutes les données depuis Supabase au montage
  useEffect(() => {
    if (!boUser) {
      setLoading(false);
      return;
    }

    async function loadBackOfficeData() {
      setLoading(true);
      try {
        // Charger toutes les données en parallèle
        const [
          acteursRes,
          dossiersRes,
          transactionsRes,
          zonesRes,
          commissionsRes,
          auditRes,
          usersRes,
          institutionsRes,
          missionsRes,
        ] = await Promise.all([
          boAPI.fetchActeurs().catch(e => { console.error('fetchActeurs:', e.message); return { acteurs: [] }; }),
          boAPI.fetchDossiers().catch(e => { console.error('fetchDossiers:', e.message); return { dossiers: [] }; }),
          boAPI.fetchTransactions().catch(e => { console.error('fetchTransactions:', e.message); return { transactions: [] }; }),
          boAPI.fetchZones().catch(e => { console.error('fetchZones:', e.message); return { zones: [] }; }),
          boAPI.fetchCommissions().catch(e => { console.error('fetchCommissions:', e.message); return { commissions: [] }; }),
          boAPI.fetchAuditLogs().catch(e => { console.error('fetchAuditLogs:', e.message); return { logs: [] }; }),
          boAPI.fetchBOUsers().catch(e => { console.error('fetchBOUsers:', e.message); return { users: [] }; }),
          boAPI.fetchInstitutions().catch(e => { console.error('fetchInstitutions:', e.message); return { institutions: [] }; }),
          boAPI.fetchMissions().catch(e => { console.error('fetchMissions:', e.message); return { missions: [] }; }),
        ]);

        setActeurs(acteursRes.acteurs);
        setDossiers(dossiersRes.dossiers);
        setTransactions(transactionsRes.transactions);
        setZones(zonesRes.zones);
        setCommissions(commissionsRes.commissions);
        setAuditLogs(auditRes.logs);
        setBOUsers(usersRes.users);
        setInstitutions(institutionsRes.institutions);
        setMissions(missionsRes.missions);

        console.log('Donnees Back-Office chargees depuis Supabase');
      } catch (error) {
        console.error('Erreur chargement donnees BO:', error);
        const msg = error instanceof Error ? error.message : 'Erreur inconnue';
        if (msg !== 'SESSION_EXPIRED') {
          toast.error('Erreur de chargement des donnees Back-Office', { description: msg });
        }
      } finally {
        setLoading(false);
      }
    }

    loadBackOfficeData();
  }, [boUser]);

  const hasPermission = (permission: string): boolean => {
    if (!boUser) return false;
    return PERMISSIONS[boUser.role]?.includes(permission) ?? false;
  };

  const addAuditLog = (log: Omit<BOAuditLog, 'id' | 'date'>) => {
    const newLog: BOAuditLog = {
      ...log,
      id: `l${Date.now()}`,
      date: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateActeurStatut = async (id: string, statut: BOActeur['statut'], logAction?: string) => {
    try {
      await boAPI.updateActeurStatut(id, statut, logAction);
      
      // Mettre à jour l'état local
      setActeurs(prev => prev.map(a => a.id === id ? { ...a, statut } : a));
      
      // Recharger les audit logs
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateActeurStatut:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour statut acteur', { description: msg });
      throw error;
    }
  };

  const updateDossierStatut = async (id: string, statut: BODossier['statut'], motif?: string) => {
    try {
      await boAPI.updateDossierStatut(id, statut, motif);
      setDossiers(prev => prev.map(d => d.id === id ? { ...d, statut, motifRejet: motif, dateModification: new Date().toISOString().split('T')[0] } : d));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateDossierStatut:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour dossier', { description: msg });
      throw error;
    }
  };

  const updateZoneStatut = async (id: string, statut: BOZone['statut']) => {
    try {
      await boAPI.updateZoneStatut(id, statut);
      setZones(prev => prev.map(z => z.id === id ? { ...z, statut } : z));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateZoneStatut:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour zone', { description: msg });
      throw error;
    }
  };

  const addZone = async (data: { nom: string; region: string; gestionnaire?: string }) => {
    try {
      const { zone } = await boAPI.createZone(data);
      setZones(prev => [...prev, zone]);
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur addZone:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec creation zone', { description: msg });
      throw error;
    }
  };

  const updateZoneData = async (id: string, data: { nom?: string; region?: string; gestionnaire?: string }) => {
    try {
      const { zone } = await boAPI.updateZone(id, data);
      setZones(prev => prev.map(z => z.id === id ? zone : z));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateZoneData:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour zone', { description: msg });
      throw error;
    }
  };

  const updateCommissionStatut = async (id: string, statut: BOCommission['statut']) => {
    try {
      await boAPI.updateCommissionStatut(id, statut);
      setCommissions(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateCommissionStatut:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour commission', { description: msg });
      throw error;
    }
  };

  const addBOUser = async (user: { prenom: string; nom: string; email: string; password: string; role: BORoleType; region?: string }) => {
    try {
      const { user: newUser } = await boAPI.createBOUser(user);
      setBOUsers(prev => [...prev, newUser]);
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur addBOUser:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec creation utilisateur BO', { description: msg });
      throw error;
    }
  };

  const updateBOUserActif = async (id: string, actif: boolean) => {
    try {
      await boAPI.updateBOUserActif(id, actif);
      setBOUsers(prev => prev.map(u => u.id === id ? { ...u, actif } : u));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateBOUserActif:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour utilisateur', { description: msg });
      throw error;
    }
  };

  const addInstitution = async (inst: Omit<InstitutionBO, 'id' | 'dateCreation' | 'creePar'>) => {
    try {
      const { institution } = await boAPI.createInstitution(inst);
      setInstitutions(prev => [...prev, institution]);
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur addInstitution:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec creation institution', { description: msg });
      throw error;
    }
  };

  const updateInstitutionModules = async (id: string, modules: ModuleAcces) => {
    try {
      await boAPI.updateInstitutionModules(id, modules);
      setInstitutions(prev => prev.map(i => i.id === id ? { ...i, modules } : i));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateInstitutionModules:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour modules', { description: msg });
      throw error;
    }
  };

  const updateInstitutionStatut = async (id: string, statut: InstitutionBO['statut']) => {
    try {
      await boAPI.updateInstitutionStatut(id, statut);
      setInstitutions(prev => prev.map(i => i.id === id ? { ...i, statut } : i));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateInstitutionStatut:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour institution', { description: msg });
      throw error;
    }
  };

  const deleteInstitution = async (id: string) => {
    try {
      await boAPI.deleteInstitution(id);
      setInstitutions(prev => prev.filter(i => i.id !== id));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur deleteInstitution:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec suppression institution', { description: msg });
      throw error;
    }
  };

  const addMission = async (data: any) => {
    try {
      const { mission } = await boAPI.createMission(data);
      setMissions(prev => [mission, ...prev]);
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur addMission:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec creation mission', { description: msg });
      throw error;
    }
  };

  const updateMissionStatut = async (id: string, statut: string) => {
    try {
      const { mission } = await boAPI.updateMissionStatut(id, statut);
      setMissions(prev => prev.map(m => m.id === id ? mission : m));
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur updateMissionStatut:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec mise a jour mission', { description: msg });
      throw error;
    }
  };

  const createIdentificateur = async (data: { prenom: string; nom: string; telephone: string; cni?: string; region?: string; zoneId?: string; objectifMensuel?: string; institutionRattachee?: string }) => {
    try {
      await boAPI.createIdentificateur(data);
      const { logs } = await boAPI.fetchAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Erreur createIdentificateur:', error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      if (msg !== 'SESSION_EXPIRED') toast.error('Echec creation identificateur', { description: msg });
      throw error;
    }
  };

  return (
    <BackOfficeContext.Provider value={{
      boUser, setBOUser, hasPermission,
      acteurs, dossiers, transactions, zones, commissions, auditLogs, boUsers, institutions, missions,
      updateActeurStatut, updateDossierStatut, updateZoneStatut, addZone, updateZoneData, updateCommissionStatut, addAuditLog,
      addBOUser, updateBOUserActif,
      addInstitution, updateInstitutionModules, updateInstitutionStatut, deleteInstitution,
      addMission, updateMissionStatut, createIdentificateur,
    }}>
      {children}
    </BackOfficeContext.Provider>
  );
}

export function useBackOffice() {
  const ctx = useContext(BackOfficeContext);
  if (!ctx) throw new Error('useBackOffice must be used within BackOfficeProvider');
  return ctx;
}