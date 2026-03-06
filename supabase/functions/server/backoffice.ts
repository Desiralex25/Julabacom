/**
 * Routes Back-Office JÙLABA
 * Gestion centralisée des données BO via KV Store Supabase
 */

import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { sharedSupabase as supabase } from "./auth-helper.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type BORoleType = 'super_admin' | 'admin_national' | 'gestionnaire_zone' | 'analyste';

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

export interface InstitutionBO {
  id: string;
  nom: string;
  type: 'cnps' | 'bni' | 'ministere' | 'anader' | 'ong' | 'autre';
  region: string;
  email: string;
  referentNom: string;
  referentTelephone: string;
  statut: 'actif' | 'suspendu';
  dateCreation: string;
  modules: {
    dashboard: 'aucun' | 'lecture' | 'complet';
    analytics: 'aucun' | 'lecture' | 'complet';
    acteurs: 'aucun' | 'lecture' | 'complet';
    supervision: 'aucun' | 'lecture' | 'complet';
    audit: 'aucun' | 'lecture' | 'complet';
    export: 'aucun' | 'lecture' | 'complet';
  };
  creePar: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vérifier l'authentification et les permissions
 */
async function checkAuthBO(c: Context, requiredRole?: BORoleType[]): Promise<{ authorized: boolean; user?: any; error?: string }> {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return { authorized: false, error: 'Token manquant' };
  }

  const { data: authUser, error: authError } = await supabase.auth.getUser(accessToken);
  
  if (authError || !authUser?.user) {
    return { authorized: false, error: 'Non autorisé' };
  }

  // Récupérer le profil utilisateur
  const { data: userProfile, error: profileError } = await supabase
    .from('users_julaba')
    .select('*')
    .eq('auth_user_id', authUser.user.id)
    .single();

  if (profileError || !userProfile) {
    return { authorized: false, error: 'Profil introuvable' };
  }

  // Vérifier si c'est un rôle BO
  const boRoles: BORoleType[] = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'];
  if (!boRoles.includes(userProfile.role)) {
    return { authorized: false, error: 'Accès refusé - rôle insuffisant' };
  }

  // Vérifier les permissions spécifiques si requises
  if (requiredRole && !requiredRole.includes(userProfile.role)) {
    return { authorized: false, error: 'Permissions insuffisantes' };
  }

  return { authorized: true, user: userProfile };
}

/**
 * Ajouter un log d'audit
 */
async function addAuditLog(log: Omit<BOAuditLog, 'id' | 'date'>) {
  const newLog: BOAuditLog = {
    ...log,
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
  };
  
  // Récupérer les logs existants
  const existingLogs = await kv.get<BOAuditLog[]>('bo_audit_logs') || [];
  
  // Ajouter le nouveau log en début de tableau
  const updatedLogs = [newLog, ...existingLogs];
  
  // Limiter à 1000 logs maximum
  if (updatedLogs.length > 1000) {
    updatedLogs.splice(1000);
  }
  
  await kv.set('bo_audit_logs', updatedLogs);
  
  return newLog;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Acteurs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/acteurs - Liste tous les acteurs
 */
export async function getActeurs(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    // Charger les acteurs depuis users_julaba
    const { data: users, error } = await supabase
      .from('users_julaba')
      .select('*')
      .in('role', ['marchand', 'producteur', 'cooperative', 'institution', 'identificateur'])
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching acteurs:', error);
      return c.json({ error: 'Erreur lors du chargement des acteurs' }, 500);
    }

    // Mapper vers le format BOActeur
    const acteurs: BOActeur[] = (users || []).map(user => ({
      id: user.id,
      nom: user.last_name || '',
      prenoms: user.first_name || '',
      telephone: user.phone,
      type: user.role,
      region: user.region || '',
      commune: user.commune || '',
      statut: user.validated ? 'actif' : 'en_attente',
      dateInscription: user.created_at,
      score: user.score || 0,
      transactionsTotal: 0, // TODO: calculer depuis transactions
      volumeTotal: 0, // TODO: calculer depuis transactions
      validated: user.validated,
      zone: user.region,
      activite: user.activity,
      email: `${user.phone}@julaba.local`,
      cni: user.cni_number
    }));

    return c.json({ acteurs });
  } catch (error) {
    console.log('Error in getActeurs:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /backoffice/acteurs/:id/statut - Modifier le statut d'un acteur
 */
export async function updateActeurStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national', 'gestionnaire_zone']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const acteurId = c.req.param('id');
    const { statut, logAction } = await c.req.json();

    if (!statut || !['actif', 'suspendu', 'en_attente', 'rejete'].includes(statut)) {
      return c.json({ error: 'Statut invalide' }, 400);
    }

    // Récupérer l'acteur actuel
    const { data: acteur, error: fetchError } = await supabase
      .from('users_julaba')
      .select('*')
      .eq('id', acteurId)
      .single();

    if (fetchError || !acteur) {
      return c.json({ error: 'Acteur introuvable' }, 404);
    }

    // Mettre à jour le statut
    const validated = statut === 'actif';
    const { error: updateError } = await supabase
      .from('users_julaba')
      .update({ validated })
      .eq('id', acteurId);

    if (updateError) {
      console.log('Error updating acteur:', updateError);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    // Ajouter un log d'audit
    await addAuditLog({
      action: logAction || `MODIFICATION statut → ${statut}`,
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: `${acteur.first_name} ${acteur.last_name}`,
      ancienneValeur: acteur.validated ? 'actif' : 'en_attente',
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Acteurs',
    });

    return c.json({ success: true, statut });
  } catch (error) {
    console.log('Error in updateActeurStatut:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Dossiers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/dossiers - Liste tous les dossiers d'enrôlement
 */
export async function getDossiers(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const dossiers = await kv.get<BODossier[]>('bo_dossiers') || [];
    return c.json({ dossiers });
  } catch (error) {
    console.log('Error in getDossiers:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /backoffice/dossiers/:id/statut - Modifier le statut d'un dossier
 */
export async function updateDossierStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national', 'gestionnaire_zone']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const dossierId = c.req.param('id');
    const { statut, motif } = await c.req.json();

    const dossiers = await kv.get<BODossier[]>('bo_dossiers') || [];
    const dossierIndex = dossiers.findIndex(d => d.id === dossierId);

    if (dossierIndex === -1) {
      return c.json({ error: 'Dossier introuvable' }, 404);
    }

    const dossier = dossiers[dossierIndex];
    const ancienStatut = dossier.statut;

    // Mettre à jour le dossier
    dossiers[dossierIndex] = {
      ...dossier,
      statut,
      motifRejet: motif,
      dateModification: new Date().toISOString().split('T')[0]
    };

    await kv.set('bo_dossiers', dossiers);

    // Ajouter un log d'audit
    await addAuditLog({
      action: `${statut.toUpperCase()} dossier`,
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: dossier.acteurNom,
      ancienneValeur: ancienStatut,
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Enrôlement',
    });

    return c.json({ success: true, dossier: dossiers[dossierIndex] });
  } catch (error) {
    console.log('Error in updateDossierStatut:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// ROUTES : Transactions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/transactions - Liste toutes les transactions
 */
export async function getTransactions(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const transactions = await kv.get<BOTransaction[]>('bo_transactions') || [];
    return c.json({ transactions });
  } catch (error) {
    console.log('Error in getTransactions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Zones
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/zones - Liste toutes les zones
 */
export async function getZones(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const zones = await kv.get<BOZone[]>('bo_zones') || [];
    return c.json({ zones });
  } catch (error) {
    console.log('Error in getZones:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /backoffice/zones/:id/statut - Modifier le statut d'une zone
 */
export async function updateZoneStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const zoneId = c.req.param('id');
    const { statut } = await c.req.json();

    const zones = await kv.get<BOZone[]>('bo_zones') || [];
    const zoneIndex = zones.findIndex(z => z.id === zoneId);

    if (zoneIndex === -1) {
      return c.json({ error: 'Zone introuvable' }, 404);
    }

    const zone = zones[zoneIndex];
    const ancienStatut = zone.statut;

    zones[zoneIndex] = { ...zone, statut };
    await kv.set('bo_zones', zones);

    await addAuditLog({
      action: statut === 'active' ? 'ACTIVATION zone' : 'DÉSACTIVATION zone',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: zone.nom,
      ancienneValeur: ancienStatut,
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Zones',
    });

    return c.json({ success: true, zone: zones[zoneIndex] });
  } catch (error) {
    console.log('Error in updateZoneStatut:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /backoffice/zones - Créer une nouvelle zone
 */
export async function createZone(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { nom, region, gestionnaire } = await c.req.json();

    if (!nom || !region) {
      return c.json({ error: 'Nom et région sont obligatoires' }, 400);
    }

    const newZone: BOZone = {
      id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nom,
      region,
      gestionnaire: gestionnaire || undefined,
      nbActeurs: 0,
      nbIdentificateurs: 0,
      volumeTotal: 0,
      tauxActivite: 0,
      statut: 'active',
    };

    const zones = await kv.get<BOZone[]>('bo_zones') || [];
    zones.push(newZone);
    await kv.set('bo_zones', zones);

    await addAuditLog({
      action: 'CRÉATION zone',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: newZone.nom,
      ancienneValeur: '-',
      nouvelleValeur: region,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Zones',
    });

    return c.json({ success: true, zone: newZone }, 201);
  } catch (error) {
    console.log('Error in createZone:', error);
    return c.json({ error: 'Erreur serveur lors de la création de la zone' }, 500);
  }
}

/**
 * PATCH /backoffice/zones/:id - Mettre à jour une zone
 */
export async function updateZone(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const zoneId = c.req.param('id');
    const { nom, region, gestionnaire } = await c.req.json();

    const zones = await kv.get<BOZone[]>('bo_zones') || [];
    const zoneIndex = zones.findIndex(z => z.id === zoneId);

    if (zoneIndex === -1) {
      return c.json({ error: 'Zone introuvable' }, 404);
    }

    const zone = zones[zoneIndex];
    zones[zoneIndex] = {
      ...zone,
      nom: nom ?? zone.nom,
      region: region ?? zone.region,
      gestionnaire: gestionnaire !== undefined ? gestionnaire : zone.gestionnaire,
    };
    await kv.set('bo_zones', zones);

    await addAuditLog({
      action: 'MODIFICATION zone',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: zone.nom,
      ancienneValeur: zone.gestionnaire || 'sans gestionnaire',
      nouvelleValeur: gestionnaire || 'sans gestionnaire',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Zones',
    });

    return c.json({ success: true, zone: zones[zoneIndex] });
  } catch (error) {
    console.log('Error in updateZone:', error);
    return c.json({ error: 'Erreur serveur lors de la mise à jour de la zone' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Commissions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/commissions - Liste toutes les commissions
 */
export async function getCommissions(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const commissions = await kv.get<BOCommission[]>('bo_commissions') || [];
    return c.json({ commissions });
  } catch (error) {
    console.log('Error in getCommissions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /backoffice/commissions/:id/statut - Modifier le statut d'une commission
 */
export async function updateCommissionStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const commissionId = c.req.param('id');
    const { statut } = await c.req.json();

    const commissions = await kv.get<BOCommission[]>('bo_commissions') || [];
    const commissionIndex = commissions.findIndex(c => c.id === commissionId);

    if (commissionIndex === -1) {
      return c.json({ error: 'Commission introuvable' }, 404);
    }

    const commission = commissions[commissionIndex];
    const ancienStatut = commission.statut;

    commissions[commissionIndex] = { ...commission, statut };
    await kv.set('bo_commissions', commissions);

    await addAuditLog({
      action: statut === 'validee' ? 'VALIDATION commission' : 'PAIEMENT commission',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: commission.identificateurNom,
      ancienneValeur: ancienStatut,
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Commissions',
    });

    return c.json({ success: true, commission: commissions[commissionIndex] });
  } catch (error) {
    console.log('Error in updateCommissionStatut:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/audit - Liste tous les logs d'audit
 */
export async function getAuditLogs(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const logs = await kv.get<BOAuditLog[]>('bo_audit_logs') || [];
    return c.json({ logs });
  } catch (error) {
    console.log('Error in getAuditLogs:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Utilisateurs BO
// ────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/users - Liste tous les utilisateurs BO
 */
export async function getBOUsers(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: users, error } = await supabase
      .from('users_julaba')
      .select('*')
      .in('role', ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'])
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching BO users:', error);
      return c.json({ error: 'Erreur lors du chargement des utilisateurs' }, 500);
    }

    const boUsers = (users || []).map(user => ({
      id: user.id,
      nom: user.last_name || '',
      prenom: user.first_name || '',
      email: `${user.phone}@julaba.ci`,
      role: user.role,
      region: user.region,
      lastLogin: user.last_login_at || user.created_at,
      actif: user.validated
    }));

    return c.json({ users: boUsers });
  } catch (error) {
    console.log('Error in getBOUsers:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// ROUTES : Institutions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/institutions - Liste toutes les institutions
 */
export async function getInstitutions(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    return c.json({ institutions });
  } catch (error) {
    console.log('Error in getInstitutions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /backoffice/institutions - Créer une nouvelle institution
 */
export async function createInstitution(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const institutionData = await c.req.json();

    const newInstitution: InstitutionBO = {
      ...institutionData,
      id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateCreation: new Date().toISOString(),
      creePar: `${auth.user.first_name} ${auth.user.last_name}`,
      statut: 'actif'
    };

    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    institutions.push(newInstitution);
    await kv.set('bo_institutions', institutions);

    await addAuditLog({
      action: 'CREATION institution',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: newInstitution.nom,
      ancienneValeur: '-',
      nouvelleValeur: 'actif',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Institutions',
    });

    return c.json({ success: true, institution: newInstitution });
  } catch (error) {
    console.log('Error in createInstitution:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /backoffice/institutions/:id/modules - Mettre à jour les modules d'une institution
 */
export async function updateInstitutionModules(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const institutionId = c.req.param('id');
    const { modules } = await c.req.json();

    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    const institutionIndex = institutions.findIndex(i => i.id === institutionId);

    if (institutionIndex === -1) {
      return c.json({ error: 'Institution introuvable' }, 404);
    }

    const institution = institutions[institutionIndex];
    const ancienModules = institution.modules;

    institutions[institutionIndex] = { ...institution, modules };
    await kv.set('bo_institutions', institutions);

    await addAuditLog({
      action: 'MODIFICATION modules',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: institution.nom,
      ancienneValeur: JSON.stringify(ancienModules),
      nouvelleValeur: JSON.stringify(modules),
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Institutions',
    });

    return c.json({ success: true, institution: institutions[institutionIndex] });
  } catch (error) {
    console.log('Error in updateInstitutionModules:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /backoffice/institutions/:id/statut - Modifier le statut d'une institution
 */
export async function updateInstitutionStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const institutionId = c.req.param('id');
    const { statut } = await c.req.json();

    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    const institutionIndex = institutions.findIndex(i => i.id === institutionId);

    if (institutionIndex === -1) {
      return c.json({ error: 'Institution introuvable' }, 404);
    }

    const institution = institutions[institutionIndex];
    const ancienStatut = institution.statut;

    institutions[institutionIndex] = { ...institution, statut };
    await kv.set('bo_institutions', institutions);

    await addAuditLog({
      action: statut === 'actif' ? 'ACTIVATION institution' : 'DÉSACTIVATION institution',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: institution.nom,
      ancienneValeur: ancienStatut,
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Institutions',
    });

    return c.json({ success: true, institution: institutions[institutionIndex] });
  } catch (error) {
    console.log('Error in updateInstitutionStatut:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * DELETE /backoffice/institutions/:id - Supprimer une institution
 */
export async function deleteInstitution(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const institutionId = c.req.param('id');

    const institutions = await kv.get<InstitutionBO[]>('bo_institutions') || [];
    const institution = institutions.find(i => i.id === institutionId);

    if (!institution) {
      return c.json({ error: 'Institution introuvable' }, 404);
    }

    const filteredInstitutions = institutions.filter(i => i.id !== institutionId);
    await kv.set('bo_institutions', filteredInstitutions);

    await addAuditLog({
      action: 'SUPPRESSION institution',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: institution.nom,
      ancienneValeur: 'actif',
      nouvelleValeur: 'supprimé',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Institutions',
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in deleteInstitution:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Création Utilisateur BO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /backoffice/users - Créer un utilisateur Back-Office
 */
export async function createBOUser(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { prenom, nom, email, password, role, region } = await c.req.json();

    if (!prenom || !nom || !email || !password || !role) {
      return c.json({ error: 'Champs obligatoires manquants : prenom, nom, email, password, role' }, 400);
    }

    const validBoRoles = ['admin_national', 'gestionnaire_zone', 'analyste'];
    if (!validBoRoles.includes(role)) {
      return c.json({ error: 'Rôle BO invalide. Valeurs acceptées : admin_national, gestionnaire_zone, analyste' }, 400);
    }

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: prenom, last_name: nom, role },
    });

    if (authError) {
      console.log('Erreur création auth utilisateur BO:', authError);
      return c.json({ error: 'Erreur lors de la création du compte', details: authError.message }, 500);
    }

    // Générer un phone unique (les users BO n'ont pas toujours de téléphone)
    const fakePHone = `BO${Date.now().toString().slice(-8)}`;

    // Créer le profil dans users_julaba
    const { data: profile, error: profileError } = await supabase
      .from('users_julaba')
      .insert({
        auth_user_id: authData.user.id,
        phone: fakePHone,
        first_name: prenom,
        last_name: nom,
        role,
        region: region || 'National',
        validated: true,
        score: 100,
      })
      .select()
      .single();

    if (profileError) {
      console.log('Erreur création profil utilisateur BO:', profileError);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ error: 'Erreur lors de la création du profil', details: profileError.message }, 500);
    }

    await addAuditLog({
      action: 'CRÉATION utilisateur BO',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: `${prenom} ${nom}`,
      ancienneValeur: '-',
      nouvelleValeur: role,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Utilisateurs',
    });

    return c.json({
      success: true,
      user: {
        id: profile.id,
        nom,
        prenom,
        email,
        role,
        region: region || 'National',
        lastLogin: new Date().toISOString(),
        actif: true,
      },
    }, 201);
  } catch (error) {
    console.log('Erreur createBOUser:', error);
    return c.json({ error: 'Erreur serveur lors de la création de l\'utilisateur BO', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

/**
 * PATCH /backoffice/users/:id/actif - Activer / Désactiver un utilisateur BO
 */
export async function updateBOUserActif(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const userId = c.req.param('id');
    const { actif } = await c.req.json();

    const { data: user, error: fetchError } = await supabase
      .from('users_julaba')
      .select('first_name, last_name, role, validated')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return c.json({ error: 'Utilisateur introuvable' }, 404);
    }

    const { error: updateError } = await supabase
      .from('users_julaba')
      .update({ validated: actif })
      .eq('id', userId);

    if (updateError) {
      console.log('Erreur mise à jour statut utilisateur BO:', updateError);
      return c.json({ error: 'Erreur lors de la mise à jour', details: updateError.message }, 500);
    }

    await addAuditLog({
      action: actif ? 'RÉACTIVATION utilisateur BO' : 'DÉSACTIVATION utilisateur BO',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: `${user.first_name} ${user.last_name}`,
      ancienneValeur: user.validated ? 'actif' : 'inactif',
      nouvelleValeur: actif ? 'actif' : 'inactif',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Utilisateurs',
    });

    return c.json({ success: true, actif });
  } catch (error) {
    console.log('Erreur updateBOUserActif:', error);
    return c.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES : Missions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /backoffice/missions - Lister toutes les missions
 */
export async function getMissions(c: Context) {
  const auth = await checkAuthBO(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const missions = await kv.get<any[]>('bo_missions') || [];
    return c.json({ missions });
  } catch (error) {
    console.log('Erreur getMissions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /backoffice/missions - Créer une mission
 */
export async function createMission(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const missionData = await c.req.json();

    if (!missionData.titre || !missionData.type) {
      return c.json({ error: 'Titre et type sont obligatoires' }, 400);
    }

    const newMission = {
      ...missionData,
      id: `ms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      realise: 0,
      statut: 'draft',
      participantsCount: 0,
      creePar: `${auth.user.first_name} ${auth.user.last_name}`,
      dateCreation: new Date().toISOString(),
    };

    const missions = await kv.get<any[]>('bo_missions') || [];
    missions.unshift(newMission);
    await kv.set('bo_missions', missions);

    await addAuditLog({
      action: 'CRÉATION mission',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: newMission.titre,
      ancienneValeur: '-',
      nouvelleValeur: 'draft',
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Missions',
    });

    return c.json({ success: true, mission: newMission }, 201);
  } catch (error) {
    console.log('Erreur createMission:', error);
    return c.json({ error: 'Erreur serveur lors de la création de la mission', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

/**
 * PATCH /backoffice/missions/:id/statut - Mettre à jour le statut d'une mission
 */
export async function updateMissionStatut(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const missionId = c.req.param('id');
    const { statut } = await c.req.json();

    const missions = await kv.get<any[]>('bo_missions') || [];
    const idx = missions.findIndex(m => m.id === missionId);

    if (idx === -1) {
      return c.json({ error: 'Mission introuvable' }, 404);
    }

    const ancienStatut = missions[idx].statut;
    missions[idx] = { ...missions[idx], statut };
    await kv.set('bo_missions', missions);

    await addAuditLog({
      action: statut === 'active' ? 'ACTIVATION mission' : statut === 'terminee' ? 'CLÔTURE mission' : 'MODIFICATION statut mission',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: missions[idx].titre,
      ancienneValeur: ancienStatut,
      nouvelleValeur: statut,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Missions',
    });

    return c.json({ success: true, mission: missions[idx] });
  } catch (error) {
    console.log('Erreur updateMissionStatut:', error);
    return c.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}

/**
 * POST /backoffice/enrolement/identificateur - Créer un compte identificateur depuis le BO
 */
export async function createIdentificateur(c: Context) {
  const auth = await checkAuthBO(c, ['super_admin', 'admin_national']);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { prenom, nom, telephone, cni, region, zoneId, objectifMensuel, institutionRattachee } = await c.req.json();

    if (!prenom || !nom || !telephone) {
      return c.json({ error: 'Prénom, nom et téléphone sont obligatoires' }, 400);
    }

    // Vérifier si le téléphone existe déjà
    const { data: existing } = await supabase
      .from('users_julaba')
      .select('phone')
      .eq('phone', telephone)
      .single();

    if (existing) {
      return c.json({ error: 'Ce numéro de téléphone est déjà enregistré' }, 409);
    }

    const authEmail = `${telephone}@julaba.local`;
    const defaultPassword = telephone; // Mot de passe initial = téléphone

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: authEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { phone: telephone, first_name: prenom, last_name: nom, role: 'identificateur' },
    });

    if (authError) {
      console.log('Erreur création auth identificateur:', authError);
      return c.json({ error: 'Erreur lors de la création du compte', details: authError.message }, 500);
    }

    const { data: profile, error: profileError } = await supabase
      .from('users_julaba')
      .insert({
        auth_user_id: authData.user.id,
        phone: telephone,
        first_name: prenom,
        last_name: nom,
        role: 'identificateur',
        region: region || null,
        cni_number: cni || null,
        institution_name: institutionRattachee || null,
        score: 50,
        validated: true,
        verified_phone: true,
      })
      .select()
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ error: 'Erreur lors de la création du profil', details: profileError.message }, 500);
    }

    await addAuditLog({
      action: 'CRÉATION identificateur',
      utilisateurBO: `${auth.user.first_name} ${auth.user.last_name}`,
      roleBO: auth.user.role,
      acteurImpacte: `${prenom} ${nom}`,
      ancienneValeur: '-',
      nouvelleValeur: `Zone: ${zoneId || 'non assigné'}`,
      ip: c.req.header('x-forwarded-for') || 'unknown',
      module: 'Enrôlement',
    });

    return c.json({ success: true, user: { id: profile.id, phone: telephone, firstName: prenom, lastName: nom, role: 'identificateur' } }, 201);
  } catch (error) {
    console.log('Erreur createIdentificateur:', error);
    return c.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' }, 500);
  }
}