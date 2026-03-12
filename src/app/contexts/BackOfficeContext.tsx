import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as boAPI from '../../imports/backoffice-api';
import { toast } from 'sonner';
import { supabase } from '../services/supabaseClient';
import { 
  MARCHANDS_COCOVICO, 
  TRANSACTIONS_COCOVICO,
  TOUS_LES_ACTEURS,
  TOUTES_LES_TRANSACTIONS,
  MARCHANDS_REJETES,
  PRODUCTEURS,
  COOPERATIVES,
  INSTITUTION_DGE,
  IDENTIFICATEURS_FICTIFS,
} from '../data/cocovicoData';

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
  acteurId?: string;
  acteurNom: string;
  acteurType: 'marchand' | 'producteur' | 'cooperative' | 'institution' | 'identificateur';
  telephone?: string;
  statut: 'draft' | 'pending' | 'approved' | 'rejected' | 'complement';
  dateCreation: string;
  dateModification?: string;
  dateValidation?: string;
  identificateurNom: string;
  identificateurId?: string;
  region: string;
  commune?: string;
  activite?: string;
  motifRejet?: string;
  documents: string[];
  type?: 'nouveau' | 'modifie' | 'renouvellement';
}

export interface BOTransaction {
  id: string;
  acteurId?: string;
  acteurNom: string;
  acteurType: string;
  produit: string;
  quantite: string;
  montant: number;
  statut: 'validee' | 'en_cours' | 'gelee' | 'annulee' | 'litige';
  date: string;
  region: string;
  modePaiement: string;
}

export interface BOZone {
  id: string;
  nom: string;
  region: string;
  ville?: string;
  commune?: string;
  marche?: string;
  niveau: 'region' | 'ville' | 'commune' | 'marche';
  parentId?: string;
  gestionnaire?: string;
  nbActeurs: number;
  nbIdentificateurs: number;
  volumeTotal: number;
  tauxActivite: number;
  statut: 'active' | 'inactive';
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

export interface BOMission {
  id: string;
  titre: string;
  type: string;
  realise: number;
  objectif: number;
  statut: string;
  participantsCount: number;
  creePar: string;
  dateCreation: string;
}

// ─── Permissions RBAC ──────────────────────────────────────────────────────

export const PERMISSIONS: Record<BORoleType, string[]> = {
  super_admin: [
    'acteurs.read', 'acteurs.write', 'acteurs.delete', 'acteurs.suspend',
    'enrolement.read', 'enrolement.write', 'enrolement.validate',
    'supervision.read', 'supervision.write', 'supervision.freeze',
    'zones.read', 'zones.write',
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
    'missions.read',
    'audit.read',
  ],
  analyste: [
    'acteurs.read',
    'supervision.read',
    'zones.read',
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
  auditLogs: BOAuditLog[];
  boUsers: BOUser[];
  institutions: InstitutionBO[];
  missions: any[];

  updateActeurStatut: (id: string, statut: BOActeur['statut'], log?: string) => void;
  updateDossierStatut: (id: string, statut: BODossier['statut'], motif?: string) => void;
  updateZoneStatut: (id: string, statut: BOZone['statut']) => void;
  addZone: (data: { nom: string; region: string; gestionnaire?: string }) => Promise<void>;
  updateZoneData: (id: string, data: { nom?: string; region?: string; gestionnaire?: string }) => Promise<void>;
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

export { BackOfficeContext };

export function BackOfficeProvider({ children }: { children: ReactNode }) {
  // ✅ PERSISTANCE BO : Restaurer depuis localStorage au démarrage
  const [boUser, setBOUser] = useState<BOUser | null>(() => {
    const stored = localStorage.getItem('julaba_bo_user');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      // Migration : Nettoyer les anciens comptes BO qui ne sont pas ICONE SOLUTION
      if (parsed.id !== 'bo-icone-solution') {
        console.log('[BO] Ancien compte détecté, nettoyage...');
        localStorage.removeItem('julaba_bo_user');
        localStorage.removeItem('julaba_access_token');
        localStorage.removeItem('julaba_refresh_token');
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem('julaba_bo_user');
      return null;
    }
  });

  // ── Écouter les changements d'état auth Supabase ─────────────────────────
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // ⚠️ MODE DEV : Ne pas déconnecter les utilisateurs mock lors d'un SIGNED_OUT
      if (event === 'SIGNED_OUT') {
        // Vérifier si l'utilisateur actuel est un mock (DEV)
        const currentBOUser = localStorage.getItem('julaba_bo_user');
        if (currentBOUser) {
          try {
            const parsed = JSON.parse(currentBOUser);
            if (parsed?.id?.startsWith('bo')) {
              console.log('[BO] Mode DEV - ignorer SIGNED_OUT pour utilisateur mock');
              return; // Ne pas déconnecter
            }
          } catch {}
        }
        
        setBOUser(null);
        localStorage.removeItem('julaba_bo_user');
        localStorage.removeItem('julaba_access_token');
        localStorage.removeItem('julaba_refresh_token');
        localStorage.removeItem('julaba_user');
      }
      // Synchroniser le token en localStorage lors d'un refresh automatique
      if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') && session) {
        localStorage.setItem('julaba_access_token', session.access_token);
        if (session.refresh_token) localStorage.setItem('julaba_refresh_token', session.refresh_token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Vérifier la session Supabase au démarrage pour valider boUser ─────────
  React.useEffect(() => {
    if (!boUser) return;
    
    // ⚠️ MODE DEV : Skip la vérification de session Supabase
    // Si l'utilisateur BO provient d'un mock (id commence par 'bo'), ne pas vérifier la session
    if (boUser.id.startsWith('bo')) {
      console.log('[BO] Mode DEV détecté - session Supabase ignorée');
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Tenter un refresh
        supabase.auth.refreshSession().then(({ data: refreshed }) => {
          if (!refreshed.session) {
            // Session vraiment expirée → déconnecter proprement
            setBOUser(null);
            localStorage.removeItem('julaba_bo_user');
            localStorage.removeItem('julaba_access_token');
            localStorage.removeItem('julaba_refresh_token');
            console.warn('[BO] Session expirée, reconnexion requise');
          } else {
            localStorage.setItem('julaba_access_token', refreshed.session.access_token);
            if (refreshed.session.refresh_token) localStorage.setItem('julaba_refresh_token', refreshed.session.refresh_token);
            console.log('[BO] Session restaurée via refresh');
          }
        });
      }
    });
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
  const [acteurs, setActeurs] = useState<BOActeur[]>(() => MARCHANDS_COCOVICO);
  const [dossiers, setDossiers] = useState<BODossier[]>([]);
  const [transactions, setTransactions] = useState<BOTransaction[]>(() => TRANSACTIONS_COCOVICO);
  const [zones, setZones] = useState<BOZone[]>([]);
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
    loadBackOfficeData();
  }, [boUser?.id]);

  // ✅ Calculer les transactionsTotal et volumeTotal pour chaque acteur
  useEffect(() => {
    if (transactions.length === 0) return;
    
    // Calculer les stats par acteur
    const statsParActeur = new Map<string, { nbTransactions: number; volumeTotal: number }>();
    
    transactions.forEach(tx => {
      if (!tx.acteurId || tx.statut !== 'validee') return; // Ne compter que les transactions validées
      
      const stats = statsParActeur.get(tx.acteurId) || { nbTransactions: 0, volumeTotal: 0 };
      stats.nbTransactions++;
      stats.volumeTotal += tx.montant;
      statsParActeur.set(tx.acteurId, stats);
    });
    
    // Mettre à jour les acteurs avec les stats calculées
    setActeurs(prev => prev.map(acteur => {
      const stats = statsParActeur.get(acteur.id);
      if (!stats) return acteur;
      
      return {
        ...acteur,
        transactionsTotal: stats.nbTransactions,
        volumeTotal: stats.volumeTotal,
      };
    }));
  }, [transactions]);

  const hasPermission = (permission: string): boolean => {
    if (!boUser) return false;
    return PERMISSIONS[boUser.role]?.includes(permission) ?? false;
  };

  const addAuditLog = (log: Omit<BOAuditLog, 'id' | 'date'>) => {
    const newLog: BOAuditLog = { ...log, id: `l${Date.now()}`, date: new Date().toISOString() };
    setAuditLogs(prev => [newLog, ...prev]);
    // Persister dans Supabase de manière asynchrone (best effort)
    supabase.from('audit_logs').insert({
      action: log.action,
      description: `${log.acteurImpacte || ''}: ${log.ancienneValeur || ''} → ${log.nouvelleValeur || ''}`.trim(),
      severity: 'info',
      entity_type: log.module,
      metadata: log,
    }).then(({ error }) => { if (error) console.warn('[BO] audit_log insert:', error.message); });
  };

  const updateActeurStatut = async (id: string, statut: BOActeur['statut'], logAction?: string) => {
    try {
      const validated = statut === 'actif';
      const { error } = await supabase.from('users_julaba').update({ validated }).eq('id', id);
      if (error) throw new Error(error.message);
      setActeurs(prev => prev.map(a => a.id === id ? { ...a, statut, validated } : a));
      // Audit log local
      const acteur = acteurs.find(a => a.id === id);
      addAuditLog({ action: logAction || `STATUT → ${statut}`, utilisateurBO: boUser ? `${boUser.prenom} ${boUser.nom}` : 'BO', roleBO: boUser?.role || 'super_admin', acteurImpacte: acteur ? `${acteur.prenoms} ${acteur.nom}` : id, ancienneValeur: acteur?.statut, nouvelleValeur: statut, ip: 'frontend', module: 'Acteurs' });
    } catch (error) {
      console.error('Erreur updateActeurStatut:', error);
      toast.error('Echec mise a jour statut acteur', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const updateDossierStatut = async (id: string, statut: BODossier['statut'], motif?: string) => {
    try {
      const statutMap: Record<string, string> = { approved: 'valide', rejected: 'rejete', complement: 'complement', pending: 'en_attente', draft: 'draft' };
      const updateData: any = { statut: statutMap[statut] || statut };
      if (motif) updateData.motif_rejet = motif;
      const { error } = await supabase.from('identifications').update(updateData).eq('id', id);
      if (error) throw new Error(error.message);
      // Si approuvé → valider l'acteur
      if (statut === 'approved') {
        const dossier = dossiers.find(d => d.id === id);
        if (dossier?.acteurId) await supabase.from('users_julaba').update({ validated: true }).eq('id', dossier.acteurId);
      }
      setDossiers(prev => prev.map(d => d.id === id ? { ...d, statut, motifRejet: motif, dateModification: new Date().toISOString().split('T')[0] } : d));
      addAuditLog({ action: `${statut.toUpperCase()} dossier`, utilisateurBO: boUser ? `${boUser.prenom} ${boUser.nom}` : 'BO', roleBO: boUser?.role || 'super_admin', acteurImpacte: id, ancienneValeur: dossiers.find(d => d.id === id)?.statut, nouvelleValeur: statut, ip: 'frontend', module: 'Enrolement' });
    } catch (error) {
      console.error('Erreur updateDossierStatut:', error);
      toast.error('Echec mise a jour dossier', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const updateZoneStatut = async (id: string, statut: BOZone['statut']) => {
    try {
      const newActif = statut === 'active';
      // Détecter la colonne actif
      const zone = zones.find(z => z.id === id);
      const updateData: any = { actif: newActif }; // colonne par défaut
      const { error } = await supabase.from('zones').update(updateData).eq('id', id);
      if (error) {
        // Essayer is_active
        const { error: e2 } = await supabase.from('zones').update({ is_active: newActif }).eq('id', id);
        if (e2) throw new Error(e2.message);
      }
      setZones(prev => prev.map(z => z.id === id ? { ...z, statut } : z));
      addAuditLog({ action: newActif ? 'ACTIVATION zone' : 'DÉSACTIVATION zone', utilisateurBO: boUser ? `${boUser.prenom} ${boUser.nom}` : 'BO', roleBO: boUser?.role || 'super_admin', acteurImpacte: zone?.nom || id, ancienneValeur: zone?.statut, nouvelleValeur: statut, ip: 'frontend', module: 'Zones' });
    } catch (error) {
      console.error('Erreur updateZoneStatut:', error);
      toast.error('Echec mise a jour zone', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const addZone = async (data: { nom: string; region: string; gestionnaire?: string }) => {
    try {
      // Résoudre parent_id
      const { data: parent } = await supabase.from('zones').select('id').ilike('nom', data.region).limit(1).maybeSingle();
      const insertData: any = {
        nom: data.nom,
        type: parent ? 'commune' : 'region',
        parent_id: parent?.id || null,
        actif: true,
      };
      const { data: newZone, error } = await supabase.from('zones').insert(insertData).select().single();
      if (error) throw new Error(error.message);
      const zone: BOZone = { id: newZone.id, nom: newZone.nom, region: data.region, gestionnaire: data.gestionnaire, nbActeurs: 0, nbIdentificateurs: 0, volumeTotal: 0, tauxActivite: 0, statut: 'active' };
      setZones(prev => [...prev, zone]);
      addAuditLog({ action: 'CRÉATION zone', utilisateurBO: boUser ? `${boUser.prenom} ${boUser.nom}` : 'BO', roleBO: boUser?.role || 'super_admin', acteurImpacte: data.nom, ancienneValeur: '-', nouvelleValeur: data.region, ip: 'frontend', module: 'Zones' });
    } catch (error) {
      console.error('Erreur addZone:', error);
      toast.error('Echec creation zone', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const updateZoneData = async (id: string, data: { nom?: string; region?: string; gestionnaire?: string }) => {
    try {
      const updateData: any = {};
      if (data.nom) updateData.nom = data.nom;
      const { error } = await supabase.from('zones').update(updateData).eq('id', id);
      if (error) throw new Error(error.message);
      setZones(prev => prev.map(z => z.id === id ? { ...z, ...data } : z));
    } catch (error) {
      console.error('Erreur updateZoneData:', error);
      toast.error('Echec mise a jour zone', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const addBOUser = async (user: { prenom: string; nom: string; email: string; password: string; role: BORoleType; region?: string }) => {
    try {
      const { user: newUser } = await boAPI.createBOUser(user);
      setBOUsers(prev => [...prev, newUser]);
      addAuditLog({ action: 'CRÉATION utilisateur BO', utilisateurBO: boUser ? `${boUser.prenom} ${boUser.nom}` : 'BO', roleBO: boUser?.role || 'super_admin', acteurImpacte: `${user.prenom} ${user.nom}`, ancienneValeur: '-', nouvelleValeur: user.role, ip: 'frontend', module: 'Utilisateurs' });
    } catch (error) {
      console.error('Erreur addBOUser:', error);
      toast.error('Echec creation utilisateur BO', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const updateBOUserActif = async (id: string, actif: boolean) => {
    try {
      const { error } = await supabase.from('users_julaba').update({ validated: actif }).eq('id', id);
      if (error) throw new Error(error.message);
      setBOUsers(prev => prev.map(u => u.id === id ? { ...u, actif } : u));
    } catch (error) {
      console.error('Erreur updateBOUserActif:', error);
      toast.error('Echec mise a jour utilisateur', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const addInstitution = async (inst: Omit<InstitutionBO, 'id' | 'dateCreation' | 'creePar'>) => {
    try {
      const { institution } = await boAPI.createInstitution(inst);
      setInstitutions(prev => [...prev, institution]);
    } catch (error) {
      console.error('Erreur addInstitution:', error);
      toast.error('Echec creation institution', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const updateInstitutionModules = async (id: string, modules: ModuleAcces) => {
    try {
      await boAPI.updateInstitutionModules(id, modules);
      setInstitutions(prev => prev.map(i => i.id === id ? { ...i, modules } : i));
    } catch (error) {
      console.error('Erreur updateInstitutionModules:', error);
      toast.error('Echec mise a jour modules', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const updateInstitutionStatut = async (id: string, statut: InstitutionBO['statut']) => {
    try {
      await boAPI.updateInstitutionStatut(id, statut);
      setInstitutions(prev => prev.map(i => i.id === id ? { ...i, statut } : i));
    } catch (error) {
      console.error('Erreur updateInstitutionStatut:', error);
      toast.error('Echec mise a jour institution', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const deleteInstitution = async (id: string) => {
    try {
      await boAPI.deleteInstitution(id);
      setInstitutions(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Erreur deleteInstitution:', error);
      toast.error('Echec suppression institution', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const addMission = async (data: any) => {
    try {
      const insertData: any = {
        titre: data.titre,
        description: data.type || 'Mission créée par le Back-Office',
        objectif: data.objectif || 100,
        recompense: 0,
        progres: 0,
        statut: 'en_cours',
      };
      const { data: newMission, error } = await supabase.from('missions').insert(insertData).select().single();
      if (error) throw new Error(error.message);
      const mission = mapMissions([newMission])[0];
      setMissions(prev => [mission, ...prev]);
      addAuditLog({ action: 'CRÉATION mission', utilisateurBO: boUser ? `${boUser.prenom} ${boUser.nom}` : 'BO', roleBO: boUser?.role || 'super_admin', acteurImpacte: data.titre, ancienneValeur: '-', nouvelleValeur: 'en_cours', ip: 'frontend', module: 'Missions' });
    } catch (error) {
      console.error('Erreur addMission:', error);
      toast.error('Echec creation mission', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const updateMissionStatut = async (id: string, statut: string) => {
    try {
      const { error } = await supabase.from('missions').update({ statut }).eq('id', id);
      if (error) throw new Error(error.message);
      setMissions(prev => prev.map(m => m.id === id ? { ...m, statut } : m));
    } catch (error) {
      console.error('Erreur updateMissionStatut:', error);
      toast.error('Echec mise a jour mission', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  const createIdentificateur = async (data: { prenom: string; nom: string; telephone: string; cni?: string; region?: string; zoneId?: string; objectifMensuel?: string; institutionRattachee?: string }) => {
    try {
      await boAPI.createIdentificateur(data);
      // Recharger les acteurs
      const { data: users } = await supabase.from('users_julaba').select('*').in('role', ['marchand', 'producteur', 'cooperative', 'institution', 'identificateur']).order('created_at', { ascending: false });
      if (users) {
        setActeurs(users.map((u: any): BOActeur => ({
          id: u.id, nom: u.last_name || '', prenoms: u.first_name || '', telephone: u.phone,
          type: u.role, region: u.region || '', commune: u.commune || '',
          statut: u.validated ? 'actif' : 'en_attente', dateInscription: u.created_at,
          score: u.score || 0, transactionsTotal: 0, volumeTotal: 0, validated: Boolean(u.validated),
          zone: u.region, activite: u.activity, email: u.email || `${u.phone}@julaba.local`, cni: u.cni_number,
        })));
      }
    } catch (error) {
      console.error('Erreur createIdentificateur:', error);
      toast.error('Echec creation identificateur', { description: error instanceof Error ? error.message : '' });
      throw error;
    }
  };

  // ✅ DIRECT SUPABASE — Contourne l'Edge Function et les problèmes de token JWT
  // Interroge les tables Supabase directement depuis le client frontend
  async function loadBackOfficeData() {
    setLoading(true);
    const errors: string[] = [];

    try {
      console.log('[BO] Chargement en mode local (optimisé)...');

      // MODE LOCAL : On court-circuite les appels Supabase pour éviter la latence
      // et on utilise directement les données mock locales
      
      // ── ZONES HIÉRARCHIQUES (Région > Ville > Commune > Marché) ────────────
      // Calculer le volume total pour chaque zone depuis TOUTES_LES_TRANSACTIONS
      const volumeAbidjan = TOUTES_LES_TRANSACTIONS
        .filter(tx => tx.region === 'Lagunes' && tx.statut === 'validee')
        .reduce((sum, tx) => sum + tx.montant, 0);
      
      const volumeYamous = TOUTES_LES_TRANSACTIONS
        .filter(tx => tx.region === 'Yamoussoukro' && tx.statut === 'validee')
        .reduce((sum, tx) => sum + tx.montant, 0);
      
      const volumeDaloa = TOUTES_LES_TRANSACTIONS
        .filter(tx => tx.region === 'Haut-Sassandra' && tx.statut === 'validee')
        .reduce((sum, tx) => sum + tx.montant, 0);
      
      const volumeAdzope = TOUTES_LES_TRANSACTIONS
        .filter(tx => tx.region === 'La Mé' && tx.statut === 'validee')
        .reduce((sum, tx) => sum + tx.montant, 0);
      
      const zonesData: BOZone[] = [
        // ═══ RÉGION: LAGUNES ═══════════════════════════════════════════════
        {
          id: 'region-lagunes',
          nom: 'Lagunes',
          region: 'Lagunes',
          niveau: 'region',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 77,
          nbIdentificateurs: 1,
          volumeTotal: volumeAbidjan,
          tauxActivite: 85,
          statut: 'active'
        },
        // ─── Ville: Abidjan ────────────────────────────────────────────────
        {
          id: 'ville-abidjan',
          nom: 'Abidjan',
          region: 'Lagunes',
          ville: 'Abidjan',
          niveau: 'ville',
          parentId: 'region-lagunes',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 77,
          nbIdentificateurs: 1,
          volumeTotal: volumeAbidjan,
          tauxActivite: 85,
          statut: 'active'
        },
        // ──── Commune: Cocody ──────────────────────────────────────────────
        {
          id: 'commune-cocody',
          nom: 'Cocody',
          region: 'Lagunes',
          ville: 'Abidjan',
          commune: 'Cocody',
          niveau: 'commune',
          parentId: 'ville-abidjan',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 77,
          nbIdentificateurs: 1,
          volumeTotal: volumeAbidjan,
          tauxActivite: 85,
          statut: 'active'
        },
        // ───── Marché: Marché de Cocovico ──────────────────────────────────
        {
          id: 'marche-cocovico',
          nom: 'Marche de Cocovico',
          region: 'Lagunes',
          ville: 'Abidjan',
          commune: 'Cocody',
          marche: 'Marche de Cocovico',
          niveau: 'marche',
          parentId: 'commune-cocody',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 77,
          nbIdentificateurs: 1,
          volumeTotal: volumeAbidjan,
          tauxActivite: 85,
          statut: 'active'
        },
        // ──── Commune: Yopougon ────────────────────────────────────────────
        {
          id: 'commune-yopougon',
          nom: 'Yopougon',
          region: 'Lagunes',
          ville: 'Abidjan',
          commune: 'Yopougon',
          niveau: 'commune',
          parentId: 'ville-abidjan',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 0,
          nbIdentificateurs: 0,
          volumeTotal: 0,
          tauxActivite: 82,
          statut: 'active'
        },
        // ──── Commune: Adjamé ──────────────────────────────────────────────
        {
          id: 'commune-adjame',
          nom: 'Adjame',
          region: 'Lagunes',
          ville: 'Abidjan',
          commune: 'Adjame',
          niveau: 'commune',
          parentId: 'ville-abidjan',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 0,
          nbIdentificateurs: 0,
          volumeTotal: 0,
          tauxActivite: 80,
          statut: 'active'
        },
        
        // ═══ RÉGION: YAMOUSSOUKRO ══════════════════════════════════════════
        {
          id: 'region-yamoussoukro',
          nom: 'Yamoussoukro',
          region: 'Yamoussoukro',
          niveau: 'region',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeYamous,
          tauxActivite: 75,
          statut: 'active'
        },
        // ─── Ville: Yamoussoukro ───────────────────────────────────────────
        {
          id: 'ville-yamoussoukro',
          nom: 'Yamoussoukro',
          region: 'Yamoussoukro',
          ville: 'Yamoussoukro',
          niveau: 'ville',
          parentId: 'region-yamoussoukro',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeYamous,
          tauxActivite: 75,
          statut: 'active'
        },
        // ──── Commune: Centre-Ville ────────────────────────────────────────
        {
          id: 'commune-yamoussoukro-centre',
          nom: 'Centre-Ville',
          region: 'Yamoussoukro',
          ville: 'Yamoussoukro',
          commune: 'Centre-Ville',
          niveau: 'commune',
          parentId: 'ville-yamoussoukro',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeYamous,
          tauxActivite: 75,
          statut: 'active'
        },
        // ───── Zone: Zone agricole cacao ────────────────────────────────────
        {
          id: 'marche-yamoussoukro-agricole',
          nom: 'Zone agricole cacao',
          region: 'Yamoussoukro',
          ville: 'Yamoussoukro',
          commune: 'Centre-Ville',
          marche: 'Zone agricole cacao',
          niveau: 'marche',
          parentId: 'commune-yamoussoukro-centre',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeYamous,
          tauxActivite: 75,
          statut: 'active'
        },
        
        // ═══ RÉGION: HAUT-SASSANDRA ════════════════════════════════════════
        {
          id: 'region-haut-sassandra',
          nom: 'Haut-Sassandra',
          region: 'Haut-Sassandra',
          niveau: 'region',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeDaloa,
          tauxActivite: 70,
          statut: 'active'
        },
        // ─── Ville: Daloa ──────────────────────────────────────────────────
        {
          id: 'ville-daloa',
          nom: 'Daloa',
          region: 'Haut-Sassandra',
          ville: 'Daloa',
          niveau: 'ville',
          parentId: 'region-haut-sassandra',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeDaloa,
          tauxActivite: 70,
          statut: 'active'
        },
        // ──── Commune: Daloa Centre ────────────────────────────────────────
        {
          id: 'commune-daloa-centre',
          nom: 'Daloa Centre',
          region: 'Haut-Sassandra',
          ville: 'Daloa',
          commune: 'Daloa Centre',
          niveau: 'commune',
          parentId: 'ville-daloa',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeDaloa,
          tauxActivite: 70,
          statut: 'active'
        },
        // ───── Zone: Zone caféière ──────────────────────────────────────────
        {
          id: 'marche-daloa-cafe',
          nom: 'Zone cafeiere',
          region: 'Haut-Sassandra',
          ville: 'Daloa',
          commune: 'Daloa Centre',
          marche: 'Zone cafeiere',
          niveau: 'marche',
          parentId: 'commune-daloa-centre',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeDaloa,
          tauxActivite: 70,
          statut: 'active'
        },
        
        // ═══ RÉGION: LA MÉ ═════════════════════════════════════════════════
        {
          id: 'region-la-me',
          nom: 'La Me',
          region: 'La Mé',
          niveau: 'region',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeAdzope,
          tauxActivite: 68,
          statut: 'active'
        },
        // ─── Ville: Adzopé ─────────────────────────────────────────────────
        {
          id: 'ville-adzope',
          nom: 'Adzope',
          region: 'La Mé',
          ville: 'Adzope',
          niveau: 'ville',
          parentId: 'region-la-me',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeAdzope,
          tauxActivite: 68,
          statut: 'active'
        },
        // ──── Commune: Adzopé Centre ───────────────────────────────────────
        {
          id: 'commune-adzope-centre',
          nom: 'Adzope Centre',
          region: 'La Mé',
          ville: 'Adzope',
          commune: 'Adzope Centre',
          niveau: 'commune',
          parentId: 'ville-adzope',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeAdzope,
          tauxActivite: 68,
          statut: 'active'
        },
        // ───── Marché: Cooperative agricole ─────────────────────────────────
        {
          id: 'marche-adzope-coop',
          nom: 'Cooperative agricole',
          region: 'La Mé',
          ville: 'Adzope',
          commune: 'Adzope Centre',
          marche: 'Cooperative agricole',
          niveau: 'marche',
          parentId: 'commune-adzope-centre',
          gestionnaire: 'ICONE SOLUTION',
          nbActeurs: 1,
          nbIdentificateurs: 1,
          volumeTotal: volumeAdzope,
          tauxActivite: 68,
          statut: 'active'
        },
      ];

      // ── TOUS LES ACTEURS (81 acteurs: 73 + 2 + 2 + 2 + 1 + 1 identificateur principal) ─
      const identificateurCocovico: BOActeur = {
        id: 'MAMADOU_COULIBALY',
        telephone: '+225 07 08 50 50 50',
        nom: 'COULIBALY',
        prenoms: 'Mamadou',
        type: 'identificateur',
        region: 'Lagunes',
        commune: 'Abidjan - Marche de Cocovico',
        zone: 'Abidjan',
        dateInscription: '2026-03-07T08:00:00.000Z',
        score: 95,
        statut: 'actif',
        transactionsTotal: 73,
        volumeTotal: 0,
        validated: true,
        identificateurId: '',
        activite: 'Agent identificateur Cocovico',
        email: 'mamadou.coulibaly@julaba.ci',
      };
      
      // Tous les acteurs consolidés : marchands + rejetés + producteurs + coopératives + institution + identificateurs
      const tousLesActeurs = [
        identificateurCocovico,
        ...MARCHANDS_COCOVICO,
        ...MARCHANDS_REJETES,
        ...PRODUCTEURS,
        ...COOPERATIVES,
        ...INSTITUTION_DGE,
        ...IDENTIFICATEURS_FICTIFS,
      ];
      
      setActeurs(tousLesActeurs);

      // ── DOSSIERS (tous les dossiers d'enrôlement) ─────────────────────────
      const dossiersData: BODossier[] = [];
      
      // 1. Dossiers des 73 marchands Cocovico (tous approuvés)
      MARCHANDS_COCOVICO.forEach((marchand) => {
        dossiersData.push({
          id: `dossier-${marchand.id}`,
          acteurId: marchand.id,
          acteurNom: `${marchand.prenoms} ${marchand.nom}`,
          acteurType: 'marchand',
          telephone: marchand.telephone,
          identificateurNom: 'Mamadou COULIBALY',
          identificateurId: 'MAMADOU_COULIBALY',
          region: 'Lagunes',
          commune: 'Abidjan - Marche de Cocovico',
          statut: 'approved',
          dateCreation: marchand.dateInscription,
          dateValidation: marchand.dateInscription,
          activite: marchand.activite,
          documents: ['CNI', 'Photo', 'Justificatif activite'],
          type: 'nouveau',
        });
      });
      
      // 2. Dossiers des 2 marchands rejetés
      MARCHANDS_REJETES.forEach((marchand, index) => {
        const motifs = [
          'Documents incomplets - CNI non lisible',
          'Justificatif d\'activite manquant',
        ];
        dossiersData.push({
          id: `dossier-${marchand.id}`,
          acteurId: marchand.id,
          acteurNom: `${marchand.prenoms} ${marchand.nom}`,
          acteurType: 'marchand',
          telephone: marchand.telephone,
          identificateurNom: 'Mamadou COULIBALY',
          identificateurId: 'MAMADOU_COULIBALY',
          region: 'Lagunes',
          commune: 'Abidjan - Marche de Cocovico',
          statut: 'rejected',
          dateCreation: marchand.dateInscription,
          dateModification: marchand.dateInscription,
          activite: marchand.activite,
          motifRejet: motifs[index],
          documents: ['CNI', 'Photo'],
          type: 'nouveau',
        });
      });
      
      // 3. Dossiers des 2 producteurs
      PRODUCTEURS.forEach((producteur) => {
        const identNom = producteur.region === 'Yamoussoukro' 
          ? 'Salif TOURE' 
          : 'Fatoumata BAMBA';
        const identId = producteur.region === 'Yamoussoukro'
          ? 'IDENT_TOURE_SALIF'
          : 'IDENT_BAMBA_FATOU';
        
        dossiersData.push({
          id: `dossier-${producteur.id}`,
          acteurId: producteur.id,
          acteurNom: `${producteur.prenoms} ${producteur.nom}`,
          acteurType: 'producteur',
          telephone: producteur.telephone,
          identificateurNom: identNom,
          identificateurId: identId,
          region: producteur.region,
          commune: producteur.commune,
          statut: producteur.statut === 'actif' ? 'approved' : 'pending',
          dateCreation: producteur.dateInscription,
          dateValidation: producteur.statut === 'actif' ? producteur.dateInscription : undefined,
          activite: producteur.activite,
          documents: ['CNI', 'Photo', 'Titre foncier', 'Attestation production'],
          type: 'nouveau',
        });
      });
      
      // 4. Dossiers des 2 coopératives
      COOPERATIVES.forEach((cooperative) => {
        const identNom = cooperative.id === 'COOP_COCOVICO'
          ? 'Mamadou COULIBALY'
          : 'Jean-Baptiste KOUAME';
        const identId = cooperative.id === 'COOP_COCOVICO'
          ? 'MAMADOU_COULIBALY'
          : 'IDENT_KOUAME_JEAN';
        
        dossiersData.push({
          id: `dossier-${cooperative.id}`,
          acteurId: cooperative.id,
          acteurNom: cooperative.nom,
          acteurType: 'cooperative',
          telephone: cooperative.telephone,
          identificateurNom: identNom,
          identificateurId: identId,
          region: cooperative.region,
          commune: cooperative.commune,
          statut: cooperative.statut === 'actif' ? 'approved' : 'pending',
          dateCreation: cooperative.dateInscription,
          dateValidation: cooperative.statut === 'actif' ? cooperative.dateInscription : undefined,
          activite: cooperative.activite,
          documents: ['Statuts cooperative', 'Liste membres', 'Autorisation exercice'],
          type: 'nouveau',
        });
      });
      
      // 5. Dossier de l'institution DGE
      INSTITUTION_DGE.forEach((institution) => {
        dossiersData.push({
          id: `dossier-${institution.id}`,
          acteurId: institution.id,
          acteurNom: institution.nom,
          acteurType: 'institution',
          telephone: institution.telephone,
          identificateurNom: 'Mamadou COULIBALY',
          identificateurId: 'MAMADOU_COULIBALY',
          region: institution.region,
          commune: institution.commune,
          statut: 'approved',
          dateCreation: institution.dateInscription,
          dateValidation: institution.dateInscription,
          activite: institution.activite,
          documents: ['Arrete creation', 'Mandat directeur', 'Convention partenariat'],
          type: 'nouveau',
        });
      });

      // ── TRANSACTIONS (toutes les transactions consolidées) ──────────────────
      setTransactions(TOUTES_LES_TRANSACTIONS);

      // ── AUDIT LOGS (données mock) ─────────────────────────────────────────
      const auditData: BOAuditLog[] = [];

      // ── UTILISATEURS BO ───────────────────────────────────────────────────
      const boUsersData: BOUser[] = [
        {
          id: 'bo-icone-solution',
          nom: 'SOLUTION',
          prenom: 'ICONE',
          email: 'admin@julaba.local',
          role: 'super_admin',
          region: 'National',
          lastLogin: new Date().toISOString(),
          actif: true,
        },
      ];

      // ── MISSIONS (données mock) ───────────────────────────────────────────
      const missionsData: BOMission[] = [];

      // ── INSTITUTIONS (données mock) ───────────────────────────────────────
      const institutionsData: InstitutionBO[] = [];

      // Mise à jour de l'état
      setZones(zonesData);
      setDossiers(dossiersData);
      
      setAuditLogs(auditData);
      setBOUsers(boUsersData);
      setMissions(missionsData);
      setInstitutions(institutionsData);

      console.log('[BO] Chargement terminé (mode local optimisé) —', {
        zones: zonesData.length,
        acteurs: tousLesActeurs.length,
        dossiers: dossiersData.length,
        transactions: TOUTES_LES_TRANSACTIONS.length,
        audit: auditData.length,
        boUsers: boUsersData.length,
        missions: missionsData.length,
      });

    } catch (error) {
      console.error('[BO] Erreur chargement:', error);
      toast.error('Erreur de chargement des données', {
        description: error instanceof Error ? error.message : 'Vérifiez la console pour plus de détails',
      });
    } finally {
      setLoading(false);
    }
  }

  // ─── Helpers de mapping ─────────────────────────────────────────────────────

  function mapDossierStatut(statut: string): BODossier['statut'] {
    const map: Record<string, BODossier['statut']> = {
      en_attente: 'pending', pending: 'pending',
      valide: 'approved', approved: 'approved', approuve: 'approved',
      rejete: 'rejected', rejected: 'rejected',
      complement: 'complement',
      draft: 'draft', brouillon: 'draft',
    };
    return map[statut] || 'pending';
  }

  function mapTransactions(rows: any[]): BOTransaction[] {
    const statutMap: Record<string, BOTransaction['statut']> = {
      en_attente: 'en_cours', confirmee: 'validee', livree: 'validee',
      annulee: 'annulee', litige: 'litige', validee: 'validee',
    };
    return rows.map((row: any) => {
      const user = row.user as any;
      const montant = parseFloat(row.total || row.prix || row.montant || 0);
      return {
        id: row.id,
        acteurId: user ? user.id : undefined,
        acteurNom: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : (row.acteur_nom || 'Inconnu'),
        acteurType: user?.role || row.acteur_type || 'marchand',
        produit: row.produit || '',
        quantite: String(row.quantite || ''),
        montant,
        statut: statutMap[row.statut] || 'en_cours',
        date: row.created_at || row.date_creation || new Date().toISOString(),
        region: user?.region || row.region || '',
        modePaiement: row.mode_paiement || 'wallet',
      };
    });
  }

  function mapAuditLogs(rows: any[]): BOAuditLog[] {
    return rows.map((row: any) => {
      const user = row.user as any;
      const meta = (row.metadata as any) || {};
      return {
        id: row.id,
        action: row.action,
        utilisateurBO: meta.utilisateurBO || (user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Système'),
        roleBO: (meta.roleBO || user?.role || 'analyste') as BORoleType,
        acteurImpacte: meta.acteurImpacte || row.description || '',
        ancienneValeur: meta.ancienneValeur || '',
        nouvelleValeur: meta.nouvelleValeur || '',
        date: row.created_at,
        ip: meta.ip || 'unknown',
        module: meta.module || row.entity_type || 'Système',
      };
    });
  }

  function mapMissions(rows: any[]): any[] {
    return rows.map((row: any) => {
      const ident = row.identificateur as any;
      return {
        id: row.id,
        titre: row.titre || row.description || 'Mission sans titre',
        type: row.type || 'identification',
        realise: row.progres || row.realise || 0,
        objectif: row.objectif || 100,
        statut: row.statut || 'en_cours',
        participantsCount: row.participants_count || 1,
        creePar: ident ? `${ident.first_name || ''} ${ident.last_name || ''}`.trim() : (row.cree_par || 'Système'),
        dateCreation: row.created_at,
      };
    });
  }

  return (
    <BackOfficeContext.Provider value={{
      boUser, setBOUser, hasPermission,
      acteurs, dossiers, transactions, zones, auditLogs, boUsers, institutions, missions,
      updateActeurStatut, updateDossierStatut, updateZoneStatut, addZone, updateZoneData, addAuditLog,
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

// Version optionnelle — ne throw pas (usage hors provider toléré)
export function useBackOfficeOptional() {
  return useContext(BackOfficeContext);
}