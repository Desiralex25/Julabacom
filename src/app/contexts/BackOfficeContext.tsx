import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
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

export { BackOfficeContext };

export function BackOfficeProvider({ children }: { children: ReactNode }) {
  // ✅ PERSISTANCE BO : Restaurer depuis Supabase session au démarrage
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

  // ── Écouter les changements d'état auth Supabase ─────────────────────────
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
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
    loadBackOfficeData();
  }, [boUser?.id]);

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

  const updateCommissionStatut = async (id: string, statut: BOCommission['statut']) => {
    try {
      const { error } = await supabase.from('commissions').update({ statut }).eq('id', id);
      if (error) throw new Error(error.message);
      setCommissions(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
    } catch (error) {
      console.error('Erreur updateCommissionStatut:', error);
      toast.error('Echec mise a jour commission', { description: error instanceof Error ? error.message : '' });
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
      console.log('[BO] Chargement direct depuis Supabase...');

      // ── ZONES ─────────────────────────────────────────────────────────────
      const zonesPromise = supabase
        .from('zones')
        .select('*')
        .order('nom', { ascending: true })
        .then(({ data, error }) => {
          if (error) { console.error('[BO] zones:', error.message); errors.push('zones'); return []; }
          console.log(`[BO] zones: ${(data || []).length} lignes`);
          return (data || []).map((row: any) => ({
            id: row.id,
            nom: row.nom || row.name || '',
            region: row.region || row.parent_nom || (row.type === 'region' ? (row.nom || '') : ''),
            gestionnaire: row.gestionnaire_nom || undefined,
            nbActeurs: row.nb_acteurs || 0,
            nbIdentificateurs: row.nb_identificateurs || 0,
            volumeTotal: row.volume_total || 0,
            tauxActivite: row.taux_activite || 0,
            statut: (row.actif !== undefined ? Boolean(row.actif) : row.is_active !== undefined ? Boolean(row.is_active) : true) ? 'active' : 'inactive',
          })) as BOZone[];
        });

      // ── ACTEURS (users_julaba roles terrain) ──────────────────────────────
      const acteursPromise = supabase
        .from('users_julaba')
        .select('*')
        .in('role', ['marchand', 'producteur', 'cooperative', 'institution', 'identificateur'])
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) { console.error('[BO] acteurs:', error.message); errors.push('acteurs'); return []; }
          console.log(`[BO] acteurs: ${(data || []).length} lignes`);
          return (data || []).map((u: any): BOActeur => ({
            id: u.id,
            nom: u.last_name || '',
            prenoms: u.first_name || '',
            telephone: u.phone,
            type: u.role,
            region: u.region || '',
            commune: u.commune || '',
            statut: u.validated ? 'actif' : 'en_attente',
            dateInscription: u.created_at,
            score: u.score || 0,
            transactionsTotal: 0,
            volumeTotal: 0,
            validated: Boolean(u.validated),
            zone: u.region,
            activite: u.activity,
            email: u.email || `${u.phone}@julaba.local`,
            cni: u.cni_number,
          }));
        });

      // ── DOSSIERS (identifications) ────────────────────────────────────────
      const dossiersPromise = supabase
        .from('identifications')
        .select('*, acteur:users_julaba!acteur_id(id, first_name, last_name, role, region), identificateur:users_julaba!identificateur_id(id, first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(200)
        .then(({ data, error }) => {
          if (error) {
            console.error('[BO] dossiers (avec joins):', error.message);
            // Fallback sans joins
            return supabase.from('identifications').select('*').order('created_at', { ascending: false }).limit(200)
              .then(({ data: d2, error: e2 }) => {
                if (e2) { errors.push('dossiers'); return []; }
                return (d2 || []).map((row: any): BODossier => ({
                  id: row.id,
                  acteurId: row.acteur_id || '',
                  acteurNom: row.acteur_nom || 'Inconnu',
                  acteurType: (row.type_acteur || 'marchand') as BOActeur['type'],
                  statut: mapDossierStatut(row.statut),
                  dateCreation: row.created_at || row.date_identification,
                  dateModification: row.updated_at || row.created_at,
                  identificateurNom: row.identificateur_nom || 'Non assigné',
                  region: row.region || '',
                  motifRejet: row.motif_rejet,
                  documents: Array.isArray(row.documents) ? row.documents : [],
                }));
              });
          }
          console.log(`[BO] dossiers: ${(data || []).length} lignes`);
          return (data || []).map((row: any): BODossier => {
            const acteur = row.acteur as any;
            const ident = row.identificateur as any;
            return {
              id: row.id,
              acteurId: acteur?.id || row.acteur_id || '',
              acteurNom: acteur ? `${acteur.first_name || ''} ${acteur.last_name || ''}`.trim() : (row.acteur_nom || 'Inconnu'),
              acteurType: (acteur?.role || row.type_acteur || 'marchand') as BOActeur['type'],
              statut: mapDossierStatut(row.statut),
              dateCreation: row.created_at || row.date_identification,
              dateModification: row.updated_at || row.created_at,
              identificateurNom: ident ? `${ident.first_name || ''} ${ident.last_name || ''}`.trim() : (row.identificateur_nom || 'Non assigné'),
              region: acteur?.region || row.region || '',
              motifRejet: row.motif_rejet,
              documents: Array.isArray(row.documents) ? row.documents : [],
            };
          });
        });

      // ── TRANSACTIONS (commandes) ──────────────────────────────────────────
      const txPromise = supabase
        .from('commandes')
        .select('*, user:users_julaba!user_id(first_name, last_name, role, region)')
        .order('created_at', { ascending: false })
        .limit(500)
        .then(({ data, error }) => {
          if (error) {
            console.error('[BO] transactions (avec joins):', error.message);
            return supabase.from('commandes').select('*').order('created_at', { ascending: false }).limit(500)
              .then(({ data: d2, error: e2 }) => {
                if (e2) { errors.push('transactions'); return []; }
                return mapTransactions(d2 || []);
              });
          }
          console.log(`[BO] transactions: ${(data || []).length} lignes`);
          return mapTransactions(data || []);
        });

      // ── COMMISSIONS ───────────────────────────────────────────────────────
      const commissionsPromise = supabase
        .from('commissions')
        .select('*, identificateur:users_julaba!identificateur_id(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(300)
        .then(({ data, error }) => {
          if (error) {
            console.error('[BO] commissions (avec joins):', error.message);
            return supabase.from('commissions').select('*').order('created_at', { ascending: false }).limit(300)
              .then(({ data: d2, error: e2 }) => {
                if (e2) { errors.push('commissions'); return []; }
                return mapCommissions(d2 || []);
              });
          }
          console.log(`[BO] commissions: ${(data || []).length} lignes`);
          return mapCommissions(data || []);
        });

      // ── AUDIT LOGS ────────────────────────────────────────────────────────
      const auditPromise = supabase
        .from('audit_logs')
        .select('*, user:users_julaba!user_id(first_name, last_name, role)')
        .order('created_at', { ascending: false })
        .limit(500)
        .then(({ data, error }) => {
          if (error) {
            console.error('[BO] audit_logs (avec joins):', error.message);
            return supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500)
              .then(({ data: d2, error: e2 }) => {
                if (e2) { errors.push('audit_logs'); return []; }
                return mapAuditLogs(d2 || []);
              });
          }
          console.log(`[BO] audit_logs: ${(data || []).length} lignes`);
          return mapAuditLogs(data || []);
        });

      // ── UTILISATEURS BO ───────────────────────────────────────────────────
      const boUsersPromise = supabase
        .from('users_julaba')
        .select('*')
        .in('role', ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'])
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) { console.error('[BO] bo_users:', error.message); errors.push('bo_users'); return []; }
          console.log(`[BO] bo_users: ${(data || []).length} lignes`);
          return (data || []).map((u: any): BOUser => ({
            id: u.id,
            nom: u.last_name || '',
            prenom: u.first_name || '',
            email: u.email || `${u.phone}@julaba.ci`,
            role: u.role,
            region: u.region,
            lastLogin: u.last_login_at || u.created_at,
            actif: Boolean(u.validated),
          }));
        });

      // ── MISSIONS ──────────────────────────────────────────────────────────
      const missionsPromise = supabase
        .from('missions')
        .select('*, identificateur:users_julaba!identificateur_id(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(200)
        .then(({ data, error }) => {
          if (error) {
            console.error('[BO] missions (avec joins):', error.message);
            return supabase.from('missions').select('*').order('created_at', { ascending: false }).limit(200)
              .then(({ data: d2, error: e2 }) => {
                if (e2) { errors.push('missions'); return []; }
                return mapMissions(d2 || []);
              });
          }
          console.log(`[BO] missions: ${(data || []).length} lignes`);
          return mapMissions(data || []);
        });

      // ── INSTITUTIONS (KV Store) ────────────────────────────────────────────
      const institutionsPromise = boAPI.fetchInstitutions()
        .then(r => r.institutions)
        .catch(() => [] as InstitutionBO[]);

      // Exécuter tout en parallèle
      const [zonesData, acteursData, dossiersData, txData, commissionsData, auditData, boUsersData, missionsData, institutionsData] = await Promise.all([
        zonesPromise, acteursPromise, dossiersPromise, txPromise, commissionsPromise, auditPromise, boUsersPromise, missionsPromise, institutionsPromise,
      ]);

      setZones(zonesData);
      setActeurs(acteursData);
      setDossiers(dossiersData);
      setTransactions(txData);
      setCommissions(commissionsData);
      setAuditLogs(auditData);
      setBOUsers(boUsersData);
      setMissions(missionsData);
      setInstitutions(institutionsData);

      if (errors.length > 0) {
        console.warn('[BO] Tables avec erreurs:', errors.join(', '));
      }
      console.log('[BO] Chargement termine —', {
        zones: zonesData.length,
        acteurs: acteursData.length,
        dossiers: dossiersData.length,
        transactions: txData.length,
        commissions: commissionsData.length,
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
        acteurNom: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : (row.acteur_nom || 'Inconnu'),
        acteurType: user?.role || row.acteur_type || 'marchand',
        produit: row.produit || '',
        quantite: String(row.quantite || ''),
        montant,
        commission: Math.round(montant * 0.02 * 100) / 100,
        statut: statutMap[row.statut] || 'en_cours',
        date: row.created_at || row.date_creation || new Date().toISOString(),
        region: user?.region || row.region || '',
        modePaiement: row.mode_paiement || 'wallet',
      };
    });
  }

  function mapCommissions(rows: any[]): BOCommission[] {
    return rows.map((row: any) => {
      const ident = row.identificateur as any;
      return {
        id: row.id,
        identificateurNom: ident
          ? `${ident.first_name || ''} ${ident.last_name || ''}`.trim()
          : (row.identificateur_nom || 'Inconnu'),
        periode: row.periode || (row.created_at ? row.created_at.slice(0, 7) : ''),
        nbDossiers: row.nb_dossiers || 1,
        montantTotal: parseFloat(row.montant || row.montant_total || 0),
        statut: (row.statut as BOCommission['statut']) || 'en_attente',
        date: row.created_at,
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

// Version optionnelle — ne throw pas (usage hors provider toléré)
export function useBackOfficeOptional() {
  return useContext(BackOfficeContext);
}