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

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const MOCK_BO_USERS: BOUser[] = [
  { id: 'bo1', nom: 'KOUASSI', prenom: 'Yves-Roland', email: 'superadmin@julaba.ci', role: 'super_admin', lastLogin: '2026-03-02T08:30:00', actif: true },
  { id: 'bo2', nom: 'BAMBA', prenom: 'Fatoumata', email: 'admin.national@julaba.ci', role: 'admin_national', region: 'National', lastLogin: '2026-03-02T07:15:00', actif: true },
  { id: 'bo3', nom: 'KOFFI', prenom: 'Ange-Désiré', email: 'gestionnaire.abidjan@julaba.ci', role: 'gestionnaire_zone', region: 'Abidjan', lastLogin: '2026-03-01T16:45:00', actif: true },
  { id: 'bo4', nom: 'YAO', prenom: 'Esther', email: 'analyste@julaba.ci', role: 'analyste', lastLogin: '2026-02-28T11:00:00', actif: true },
  { id: 'bo5', nom: 'DIALLO', prenom: 'Mamadou', email: 'gestionnaire.bouake@julaba.ci', role: 'gestionnaire_zone', region: 'Bouaké', lastLogin: '2026-03-01T09:20:00', actif: false },
];

export const MOCK_ACTEURS: BOActeur[] = [
  { id: 'a1', nom: 'KOUASSI', prenoms: 'Jean-Baptiste', telephone: '0722456789', type: 'marchand', region: 'Abidjan', commune: 'Cocody', statut: 'actif', dateInscription: '2025-11-15', score: 87, transactionsTotal: 124, volumeTotal: 4250000, validated: true, activite: 'Vente légumes frais', email: 'jb.kouassi@email.com', cni: 'CI-AB-2019-001234' },
  { id: 'a2', nom: 'KOFFI', prenoms: 'Marie-Ange', telephone: '0722334455', type: 'producteur', region: 'Abidjan', commune: 'Yopougon', statut: 'actif', dateInscription: '2025-10-08', score: 92, transactionsTotal: 67, volumeTotal: 8900000, validated: true, activite: 'Production maraîchère', zone: 'Zone Nord Yopougon' },
  { id: 'a3', nom: 'YAO', prenoms: 'Pierre-Clément', telephone: '0722112233', type: 'marchand', region: 'Bouaké', commune: 'Centre', statut: 'en_attente', dateInscription: '2026-02-20', score: 45, transactionsTotal: 12, volumeTotal: 320000, validated: false, activite: 'Vente céréales' },
  { id: 'a4', nom: 'TOURE', prenoms: 'Awa Mariam', telephone: '0555123456', type: 'producteur', region: 'Yamoussoukro', commune: 'Attécoubé', statut: 'actif', dateInscription: '2025-09-12', score: 78, transactionsTotal: 89, volumeTotal: 5600000, validated: true, activite: 'Élevage et culture vivrière' },
  { id: 'a5', nom: 'BAMBA', prenoms: 'Koffi Sylvain', telephone: '0777889900', type: 'marchand', region: 'Abidjan', commune: 'Adjamé', statut: 'suspendu', dateInscription: '2025-08-03', score: 23, transactionsTotal: 8, volumeTotal: 95000, validated: false, activite: 'Commerce général' },
  { id: 'a6', nom: 'COULIBALY', prenoms: 'Inza', telephone: '0101234567', type: 'cooperative', region: 'Abidjan', commune: 'Treichville', statut: 'actif', dateInscription: '2025-07-22', score: 95, transactionsTotal: 230, volumeTotal: 25000000, validated: true, activite: 'Coopérative maraîchère' },
  { id: 'a7', nom: 'GNAGNE', prenoms: 'Brice-Olivier', telephone: '0505678901', type: 'identificateur', region: 'Abidjan', commune: 'Cocody', statut: 'actif', dateInscription: '2025-06-15', score: 88, transactionsTotal: 156, volumeTotal: 0, validated: true, activite: 'Identification acteurs', zone: 'Marché de Cocody' },
  { id: 'a8', nom: 'SORO', prenoms: 'Karimatou', telephone: '0404111222', type: 'marchand', region: 'San Pédro', commune: 'Centre', statut: 'actif', dateInscription: '2025-12-01', score: 71, transactionsTotal: 45, volumeTotal: 1800000, validated: true, activite: 'Vente poissons' },
  { id: 'a9', nom: 'DIOMANDE', prenoms: 'Siaka', telephone: '0303222333', type: 'producteur', region: 'Korhogo', commune: 'Nord', statut: 'actif', dateInscription: '2025-11-28', score: 83, transactionsTotal: 72, volumeTotal: 6200000, validated: true, activite: 'Élevage bovin' },
  { id: 'a10', nom: 'ASSI', prenoms: 'Christelle', telephone: '0202333444', type: 'marchand', region: 'Abidjan', commune: 'Plateau', statut: 'rejete', dateInscription: '2026-01-15', score: 15, transactionsTotal: 2, volumeTotal: 45000, validated: false, activite: 'Restauration' },
];

export const MOCK_DOSSIERS: BODossier[] = [
  { id: 'd1', acteurId: 'a3', acteurNom: 'YAO Pierre-Clément', acteurType: 'marchand', statut: 'pending', dateCreation: '2026-02-20', dateModification: '2026-02-22', identificateurNom: 'GNAGNE Brice-Olivier', region: 'Bouaké', documents: ['CNI', 'Photo', 'Fiche métier'] },
  { id: 'd2', acteurId: 'a10', acteurNom: 'ASSI Christelle', acteurType: 'marchand', statut: 'rejected', dateCreation: '2026-01-15', dateModification: '2026-01-20', identificateurNom: 'GNAGNE Brice-Olivier', region: 'Abidjan', motifRejet: 'Documents incomplets : CNI illisible', documents: ['CNI (rejeté)', 'Photo'] },
  { id: 'd3', acteurId: 'a1', acteurNom: 'KOUASSI Jean-Baptiste', acteurType: 'marchand', statut: 'approved', dateCreation: '2025-11-10', dateModification: '2025-11-15', identificateurNom: 'GNAGNE Brice-Olivier', region: 'Abidjan', documents: ['CNI', 'Photo', 'Fiche métier', 'Contrat zone'] },
  { id: 'd4', acteurId: 'a5', acteurNom: 'BAMBA Koffi Sylvain', acteurType: 'marchand', statut: 'pending', dateCreation: '2026-02-25', dateModification: '2026-02-26', identificateurNom: 'GNAGNE Brice-Olivier', region: 'Abidjan', documents: ['CNI', 'Photo'] },
  { id: 'd5', acteurId: 'a6', acteurNom: 'COULIBALY Inza', acteurType: 'cooperative', statut: 'complement', dateCreation: '2026-02-10', dateModification: '2026-02-28', identificateurNom: 'GNAGNE Brice-Olivier', region: 'Abidjan', documents: ['Statuts', 'Liste membres', 'CNI président'] },
];

export const MOCK_TRANSACTIONS: BOTransaction[] = [
  { id: 't1', acteurNom: 'KOUASSI Jean-Baptiste', acteurType: 'Marchand', produit: 'Tomates fraîches', quantite: '50 kg', montant: 37500, commission: 375, statut: 'validee', date: '2026-03-02T09:15:00', region: 'Abidjan', modePaiement: 'Mobile Money' },
  { id: 't2', acteurNom: 'KOFFI Marie-Ange', acteurType: 'Producteur', produit: 'Ignames', quantite: '200 kg', montant: 140000, commission: 1400, statut: 'validee', date: '2026-03-02T08:30:00', region: 'Abidjan', modePaiement: 'Cash' },
  { id: 't3', acteurNom: 'COULIBALY Inza', acteurType: 'Coopérative', produit: 'Maïs grain', quantite: '1000 kg', montant: 500000, commission: 5000, statut: 'en_cours', date: '2026-03-02T07:45:00', region: 'Abidjan', modePaiement: 'Virement' },
  { id: 't4', acteurNom: 'BAMBA Koffi', acteurType: 'Marchand', produit: 'Piment', quantite: '10 kg', montant: 15000, commission: 150, statut: 'gelee', date: '2026-03-01T14:20:00', region: 'Abidjan', modePaiement: 'Mobile Money' },
  { id: 't5', acteurNom: 'SORO Karimatou', acteurType: 'Marchand', produit: 'Poissons frais', quantite: '30 kg', montant: 45000, commission: 450, statut: 'validee', date: '2026-03-01T11:00:00', region: 'San Pédro', modePaiement: 'Cash' },
  { id: 't6', acteurNom: 'DIOMANDE Siaka', acteurType: 'Producteur', produit: 'Bétail', quantite: '5 têtes', montant: 1250000, commission: 12500, statut: 'validee', date: '2026-02-28T16:30:00', region: 'Korhogo', modePaiement: 'Virement' },
  { id: 't7', acteurNom: 'YAO Pierre-Clément', acteurType: 'Marchand', produit: 'Aubergines', quantite: '20 kg', montant: 16000, commission: 160, statut: 'annulee', date: '2026-02-27T10:15:00', region: 'Bouaké', modePaiement: 'Mobile Money' },
];

export const MOCK_ZONES: BOZone[] = [
  { id: 'z1', nom: 'Grand Abidjan Nord', region: 'Abidjan', gestionnaire: 'KOFFI Ange-Désiré', nbActeurs: 4823, nbIdentificateurs: 47, volumeTotal: 125000000, tauxActivite: 87, statut: 'active' },
  { id: 'z2', nom: 'Grand Abidjan Sud', region: 'Abidjan', gestionnaire: 'ASSI Roméo', nbActeurs: 3241, nbIdentificateurs: 32, volumeTotal: 98000000, tauxActivite: 79, statut: 'active' },
  { id: 'z3', nom: 'Bouaké Centre', region: 'Bouaké', gestionnaire: 'DIALLO Mamadou', nbActeurs: 1876, nbIdentificateurs: 18, volumeTotal: 45000000, tauxActivite: 62, statut: 'active' },
  { id: 'z4', nom: 'San Pédro Littoral', region: 'San Pédro', gestionnaire: undefined, nbActeurs: 892, nbIdentificateurs: 9, volumeTotal: 28000000, tauxActivite: 55, statut: 'active' },
  { id: 'z5', nom: 'Korhogo Nord', region: 'Korhogo', gestionnaire: 'SORO Abib', nbActeurs: 1204, nbIdentificateurs: 12, volumeTotal: 38000000, tauxActivite: 71, statut: 'active' },
  { id: 'z6', nom: 'Yamoussoukro Centre', region: 'Yamoussoukro', gestionnaire: undefined, nbActeurs: 634, nbIdentificateurs: 6, volumeTotal: 18000000, tauxActivite: 45, statut: 'inactive' },
];

export const MOCK_COMMISSIONS: BOCommission[] = [
  { id: 'c1', identificateurNom: 'GNAGNE Brice-Olivier', periode: 'Février 2026', nbDossiers: 23, montantTotal: 4600, statut: 'en_attente', date: '2026-03-01' },
  { id: 'c2', identificateurNom: 'TOURE Aminata', periode: 'Février 2026', nbDossiers: 31, montantTotal: 6200, statut: 'validee', date: '2026-03-01' },
  { id: 'c3', identificateurNom: 'KONE Drissa', periode: 'Février 2026', nbDossiers: 18, montantTotal: 3600, statut: 'payee', date: '2026-02-28' },
  { id: 'c4', identificateurNom: 'GNAGNE Brice-Olivier', periode: 'Janvier 2026', nbDossiers: 27, montantTotal: 5400, statut: 'payee', date: '2026-02-03' },
];

export const MOCK_AUDIT_LOGS: BOAuditLog[] = [
  { id: 'l1', action: 'SUSPENSION acteur', utilisateurBO: 'KOUASSI Yves-Roland', roleBO: 'super_admin', acteurImpacte: 'BAMBA Koffi Sylvain', ancienneValeur: 'actif', nouvelleValeur: 'suspendu', date: '2026-03-01T14:32:00', ip: '192.168.1.45', module: 'Acteurs' },
  { id: 'l2', action: 'VALIDATION dossier', utilisateurBO: 'BAMBA Fatoumata', roleBO: 'admin_national', acteurImpacte: 'KOUASSI Jean-Baptiste', ancienneValeur: 'pending', nouvelleValeur: 'approved', date: '2025-11-15T09:10:00', ip: '10.0.0.12', module: 'Enrôlement' },
  { id: 'l3', action: 'REJET dossier', utilisateurBO: 'BAMBA Fatoumata', roleBO: 'admin_national', acteurImpacte: 'ASSI Christelle', ancienneValeur: 'pending', nouvelleValeur: 'rejected', date: '2026-01-20T11:05:00', ip: '10.0.0.12', module: 'Enrôlement' },
  { id: 'l4', action: 'CREATION utilisateur BO', utilisateurBO: 'KOUASSI Yves-Roland', roleBO: 'super_admin', acteurImpacte: 'KOFFI Ange-Désiré', ancienneValeur: '-', nouvelleValeur: 'gestionnaire_zone', date: '2025-06-10T08:00:00', ip: '192.168.1.45', module: 'Utilisateurs' },
  { id: 'l5', action: 'GELE transaction', utilisateurBO: 'KOFFI Ange-Désiré', roleBO: 'gestionnaire_zone', acteurImpacte: 'BAMBA Koffi (t4)', ancienneValeur: 'en_cours', nouvelleValeur: 'gelee', date: '2026-03-01T14:22:00', ip: '172.16.0.8', module: 'Supervision' },
  { id: 'l6', action: 'MODIFICATION taux commission', utilisateurBO: 'KOUASSI Yves-Roland', roleBO: 'super_admin', ancienneValeur: '1.5%', nouvelleValeur: '2%', date: '2026-02-15T10:30:00', ip: '192.168.1.45', module: 'Commissions' },
];

// ─── Mock Institutions ────────────────────────────────────────────────────────

export const MOCK_INSTITUTIONS: InstitutionBO[] = [
  {
    id: 'inst1',
    nom: 'CNPS — Caisse Nationale de Prévoyance Sociale',
    type: 'cnps',
    region: 'National',
    email: 'supervision@cnps.ci',
    referentNom: 'KONAN Brou Emmanuel',
    referentTelephone: '0722 11 22 33',
    statut: 'actif',
    dateCreation: '2026-01-10',
    creePar: 'KOUASSI Yves-Roland',
    modules: {
      dashboard: 'complet',
      analytics: 'complet',
      acteurs: 'lecture',
      supervision: 'complet',
      audit: 'lecture',
      export: 'complet',
    },
  },
  {
    id: 'inst2',
    nom: 'ANADER — Agence Nationale d\'Appui au Développement Rural',
    type: 'anader',
    region: 'Gbèkè',
    email: 'data@anader.ci',
    referentNom: 'TRAORE Aboubakar',
    referentTelephone: '0701 55 66 77',
    statut: 'actif',
    dateCreation: '2026-01-28',
    creePar: 'BAMBA Fatoumata',
    modules: {
      dashboard: 'lecture',
      analytics: 'complet',
      acteurs: 'complet',
      supervision: 'lecture',
      audit: 'aucun',
      export: 'lecture',
    },
  },
  {
    id: 'inst3',
    nom: 'Ministère de l\'Agriculture et du Développement Rural',
    type: 'ministere',
    region: 'National',
    email: 'julaba@agriculture.gouv.ci',
    referentNom: 'YAO Kouamé Bertrand',
    referentTelephone: '0505 88 99 00',
    statut: 'suspendu',
    dateCreation: '2025-12-15',
    creePar: 'KOUASSI Yves-Roland',
    modules: {
      dashboard: 'lecture',
      analytics: 'lecture',
      acteurs: 'aucun',
      supervision: 'aucun',
      audit: 'aucun',
      export: 'lecture',
    },
  },
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
  const [acteurs, setActeurs] = useState<BOActeur[]>(MOCK_ACTEURS);
  const [dossiers, setDossiers] = useState<BODossier[]>(MOCK_DOSSIERS);
  const [transactions] = useState<BOTransaction[]>(MOCK_TRANSACTIONS);
  const [zones, setZones] = useState<BOZone[]>(MOCK_ZONES);
  const [commissions, setCommissions] = useState<BOCommission[]>(MOCK_COMMISSIONS);
  const [auditLogs, setAuditLogs] = useState<BOAuditLog[]>(MOCK_AUDIT_LOGS);
  const [boUsers, setBOUsers] = useState<BOUser[]>(MOCK_BO_USERS);
  const [institutions, setInstitutions] = useState<InstitutionBO[]>(MOCK_INSTITUTIONS);

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