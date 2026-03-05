import React, { createContext, useContext, useState, ReactNode } from 'react';

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

// ─── Mock Data - UNIQUEMENT pour MODE DEV ProfileSwitcher ───────────────────
// ⚠️ CRITIQUE : MOCK_BO_USERS doit rester disponible pour ProfileSwitcher.tsx
// Ne pas supprimer tant que le système d'authentification Supabase n'est pas déployé

export const MOCK_BO_USERS: BOUser[] = [
  { id: 'bo1', nom: 'KOUASSI', prenom: 'Yves-Roland', email: 'superadmin@julaba.ci', role: 'super_admin', lastLogin: '2026-03-02T08:30:00', actif: true },
  { id: 'bo2', nom: 'BAMBA', prenom: 'Fatoumata', email: 'admin.national@julaba.ci', role: 'admin_national', region: 'National', lastLogin: '2026-03-02T07:15:00', actif: true },
  { id: 'bo3', nom: 'KOFFI', prenom: 'Ange-Désiré', email: 'gestionnaire.abidjan@julaba.ci', role: 'gestionnaire_zone', region: 'Abidjan', lastLogin: '2026-03-01T16:45:00', actif: true },
  { id: 'bo4', nom: 'YAO', prenom: 'Esther', email: 'analyste@julaba.ci', role: 'analyste', lastLogin: '2026-02-28T11:00:00', actif: true },
  { id: 'bo5', nom: 'DIALLO', prenom: 'Mamadou', email: 'gestionnaire.bouake@julaba.ci', role: 'gestionnaire_zone', region: 'Bouaké', lastLogin: '2026-03-01T09:20:00', actif: false },
];

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

  updateActeurStatut: (id: string, statut: BOActeur['statut'], log?: string) => void;
  updateDossierStatut: (id: string, statut: BODossier['statut'], motif?: string) => void;
  updateZoneStatut: (id: string, statut: BOZone['statut']) => void;
  updateCommissionStatut: (id: string, statut: BOCommission['statut']) => void;
  addAuditLog: (log: Omit<BOAuditLog, 'id' | 'date'>) => void;
  addBOUser: (user: Omit<BOUser, 'id' | 'lastLogin'>) => void;
  addInstitution: (inst: Omit<InstitutionBO, 'id' | 'dateCreation' | 'creePar'>) => void;
  updateInstitutionModules: (id: string, modules: ModuleAcces) => void;
  updateInstitutionStatut: (id: string, statut: InstitutionBO['statut']) => void;
  deleteInstitution: (id: string) => void;
}

const BackOfficeContext = createContext<BackOfficeContextType | null>(null);

export function BackOfficeProvider({ children }: { children: ReactNode }) {
  const [boUser, setBOUser] = useState<BOUser | null>(null);
  
  // ✅ NETTOYAGE PHASE 2 : Suppression de toutes les données mock
  // TODO: Charger depuis Supabase
  const [acteurs, setActeurs] = useState<BOActeur[]>([]);
  const [dossiers, setDossiers] = useState<BODossier[]>([]);
  const [transactions] = useState<BOTransaction[]>([]);
  const [zones, setZones] = useState<BOZone[]>([]);
  const [commissions, setCommissions] = useState<BOCommission[]>([]);
  const [auditLogs, setAuditLogs] = useState<BOAuditLog[]>([]);
  const [boUsers, setBOUsers] = useState<BOUser[]>(MOCK_BO_USERS); // Garde MOCK_BO_USERS pour DEV
  const [institutions, setInstitutions] = useState<InstitutionBO[]>([]);

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

  const updateActeurStatut = (id: string, statut: BOActeur['statut'], logAction?: string) => {
    setActeurs(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (boUser) {
        addAuditLog({
          action: logAction || `MODIFICATION statut → ${statut}`,
          utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
          roleBO: boUser.role,
          acteurImpacte: `${a.prenoms} ${a.nom}`,
          ancienneValeur: a.statut,
          nouvelleValeur: statut,
          ip: '127.0.0.1',
          module: 'Acteurs',
        });
      }
      return { ...a, statut };
    }));
  };

  const updateDossierStatut = (id: string, statut: BODossier['statut'], motif?: string) => {
    setDossiers(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (boUser) {
        addAuditLog({
          action: `${statut.toUpperCase()} dossier`,
          utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
          roleBO: boUser.role,
          acteurImpacte: d.acteurNom,
          ancienneValeur: d.statut,
          nouvelleValeur: statut,
          ip: '127.0.0.1',
          module: 'Enrôlement',
        });
      }
      return { ...d, statut, motifRejet: motif, dateModification: new Date().toISOString().split('T')[0] };
    }));
  };

  const updateZoneStatut = (id: string, statut: BOZone['statut']) => {
    setZones(prev => prev.map(z => {
      if (z.id !== id) return z;
      if (boUser) {
        addAuditLog({
          action: statut === 'active' ? 'ACTIVATION zone' : 'DÉSACTIVATION zone',
          utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
          roleBO: boUser.role,
          acteurImpacte: z.nom,
          ancienneValeur: z.statut,
          nouvelleValeur: statut,
          ip: '127.0.0.1',
          module: 'Zones',
        });
      }
      return { ...z, statut };
    }));
  };

  const updateCommissionStatut = (id: string, statut: BOCommission['statut']) => {
    setCommissions(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (boUser) {
        addAuditLog({
          action: statut === 'validee' ? 'VALIDATION commission' : 'PAIEMENT commission',
          utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
          roleBO: boUser.role,
          acteurImpacte: c.identificateurNom,
          ancienneValeur: c.statut,
          nouvelleValeur: statut,
          ip: '127.0.0.1',
          module: 'Commissions',
        });
      }
      return { ...c, statut };
    }));
  };

  const addBOUser = (user: Omit<BOUser, 'id' | 'lastLogin'>) => {
    const newUser: BOUser = { ...user, id: `bo${Date.now()}`, lastLogin: new Date().toISOString() };
    setBOUsers(prev => [...prev, newUser]);
    if (boUser) {
      addAuditLog({
        action: 'CREATION utilisateur BO',
        utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
        roleBO: boUser.role,
        acteurImpacte: `${user.prenom} ${user.nom}`,
        ancienneValeur: '-',
        nouvelleValeur: user.role,
        ip: '127.0.0.1',
        module: 'Utilisateurs',
      });
    }
  };

  const addInstitution = (inst: Omit<InstitutionBO, 'id' | 'dateCreation' | 'creePar'>) => {
    const newInst: InstitutionBO = {
      ...inst,
      id: `inst${Date.now()}`,
      dateCreation: new Date().toISOString(),
      creePar: boUser ? `${boUser.prenom} ${boUser.nom}` : 'System',
    };
    setInstitutions(prev => [...prev, newInst]);
    if (boUser) {
      addAuditLog({
        action: 'CREATION institution',
        utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
        roleBO: boUser.role,
        acteurImpacte: inst.nom,
        ancienneValeur: '-',
        nouvelleValeur: 'actif',
        ip: '127.0.0.1',
        module: 'Institutions',
      });
    }
  };

  const updateInstitutionModules = (id: string, modules: ModuleAcces) => {
    setInstitutions(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (boUser) {
        addAuditLog({
          action: 'MODIFICATION modules',
          utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
          roleBO: boUser.role,
          acteurImpacte: i.nom,
          ancienneValeur: JSON.stringify(i.modules),
          nouvelleValeur: JSON.stringify(modules),
          ip: '127.0.0.1',
          module: 'Institutions',
        });
      }
      return { ...i, modules };
    }));
  };

  const updateInstitutionStatut = (id: string, statut: InstitutionBO['statut']) => {
    setInstitutions(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (boUser) {
        addAuditLog({
          action: statut === 'actif' ? 'ACTIVATION institution' : 'DÉSACTIVATION institution',
          utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
          roleBO: boUser.role,
          acteurImpacte: i.nom,
          ancienneValeur: i.statut,
          nouvelleValeur: statut,
          ip: '127.0.0.1',
          module: 'Institutions',
        });
      }
      return { ...i, statut };
    }));
  };

  const deleteInstitution = (id: string) => {
    setInstitutions(prev => prev.filter(i => i.id !== id));
    if (boUser) {
      addAuditLog({
        action: 'SUPPRESSION institution',
        utilisateurBO: `${boUser.prenom} ${boUser.nom}`,
        roleBO: boUser.role,
        acteurImpacte: id,
        ancienneValeur: 'actif',
        nouvelleValeur: 'supprimé',
        ip: '127.0.0.1',
        module: 'Institutions',
      });
    }
  };

  return (
    <BackOfficeContext.Provider value={{
      boUser, setBOUser, hasPermission,
      acteurs, dossiers, transactions, zones, commissions, auditLogs, boUsers, institutions,
      updateActeurStatut, updateDossierStatut, updateZoneStatut, updateCommissionStatut, addAuditLog, addBOUser,
      addInstitution, updateInstitutionModules, updateInstitutionStatut, deleteInstitution,
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
