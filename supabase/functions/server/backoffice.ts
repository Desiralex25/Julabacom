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

// ─────────────────────────────────────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────��───────────

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

// ─────────────────────────────────────────────────────────────────────────────
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